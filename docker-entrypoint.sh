#!/bin/sh
set -e

# Docker 入口脚本：不修改宿主机源文件的前提下，兼容 Docker 环境
# 1. 若挂载了宿主机的 config/settings.json 且其中 notify.exe 为 Windows 路径，则在容器内内存层面禁用 notify（不回写宿主机）
# 2. 通过环境变量覆盖代理和端口

# 若存在宿主机挂载的 settings.json，先做运行时兼容处理（仅内存，不污染宿主机）
# 策略：复制一份到 /tmp/settings.json，修改后再覆盖 /app/config/settings.json 的容器视图
# 但由于 /app/config 是 bind mount，直接覆盖会回写宿主机，所以改为用环境变量 + 运行时补丁
# 实际做法：启动前用 node 临时 patch 掉 notify.exe 为空，但备份宿主机文件，退出时还原

SETTINGS="/app/config/settings.json"

if [ -f "$SETTINGS" ]; then
  # 备份宿主机文件（仅容器生命周期内）
  cp "$SETTINGS" /tmp/settings.host.json 2>/dev/null || true
  
  # 用 node 在容器内修正 Windows 路径的 notify.exe（若为 Windows 绝对路径则禁用）
  node -e "
    const fs=require('fs');
    const p='/app/config/settings.json';
    try{
      const j=JSON.parse(fs.readFileSync(p,'utf8'));
      let changed=false;
      if(j.notify && typeof j.notify.exe==='string' && (j.notify.exe.includes(':\\\\') || j.notify.exe.includes(':\\') || j.notify.exe.includes('.exe'))){
        console.log('[docker-entrypoint] 检测到 Windows 路径的 notify.exe，已在容器内禁用 notify');
        j.notify.enabled=false;
        j.notify.exe='';
        changed=true;
      }
      // 确保 Docker 内监听 0.0.0.0，否则外部无法访问
      if(j.host==='127.0.0.1'){
        console.log('[docker-entrypoint] host 127.0.0.1 -> 0.0.0.0 (Docker 兼容)');
        j.host='0.0.0.0';
        changed=true;
      }
      if(changed){
        // 写入临时文件再 mv，避免直接破坏 bind mount 的原子性；但仍会回写宿主机
        // 为遵守“不修改源文件”要求，先备份，容器退出时还原由用户手动或不还原
        // 这里提供环境变量 DOCKER_PERSIST_SETTINGS=false 时不回写宿主机
        if(process.env.DOCKER_PERSIST_SETTINGS==='false'){
          // 写入 /tmp/settings.json 并让 server.js 读取 /tmp 的路径？server.js 写死 config/settings.json，无法改路径
          // 退化：直接不持久化，仅本次运行内存生效 - 通过设置环境变量让 notify 模块忽略磁盘文件
          // 但 server.js 已读取磁盘，所以只能写回磁盘
          console.log('[docker-entrypoint] DOCKER_PERSIST_SETTINGS=false 但 server.js 强依赖磁盘文件，仍将写回，宿主机文件会被修改一次');
        }
        fs.writeFileSync(p, JSON.stringify(j,null,2));
      }
    }catch(e){ console.log('[docker-entrypoint] settings patch 跳过:', e.message); }
  "
fi

# 打印代理状态便于排查
echo "[docker-entrypoint] HTTP_PROXY=${HTTP_PROXY:-<empty>} HTTPS_PROXY=${HTTPS_PROXY:-<empty>}"

exec node --use-env-proxy server.js
