node server based on express + mongodb + redis
======================================================

## 开发环境

```
nvm install 4.4
nvm alias default 4.4

npm install -g gulp-cli #development
npm install -g pm2 #production

mongodb (3.2.8)
redis (3.2.1)
```
### 升级node
```
nvm install <new_version> --reinstall-packages-from=node #安装node并重装global packages
或者
nvm install <new_version>
nvm reinstall-packages <old_version>
```

### 修改配置启动新实例
```
# redis启动：
redis-server 6666.conf
```
```
# 以下列出的配置项都需认真检查核对，并根据自己的情况修改，其它未列出的配置可根据需要自行调整
daemonize yes
pidfile /data/tmp/redis_6666.pid
port 6666
bind 127.0.0.1

# 空闲超时自动关闭
timeout 3600

# 日志文件
logfile /data/log/redis6666.log

# rdb持久化
dbfilename dump6666.rdb
dir /data/redis

# aof持久化，一般不用打开
appendonly no
appendfilename "appendonly6666.aof"
appendfsync no

# 慢日志
slowlog-log-slower-than 100000
slowlog-max-len 65536
```
### 目录结构
```
├── .mssql.json #为mssql命令行使用的配置文件
├── README.md
├── RELEASE.md #重大发布的发布日志
├── app.js #http服务器入口
├── auth #认证相关
├── common #通用组件
├── conf #配置文件，mongo，redis服务器启动所使用的配置文件统一管理
├── config #根据NODE_ENV加载的不同配置文件
├── controllers
├── gulpfile.js #gulp serve自动重启服务器
├── models #model设计
├── netServer.js #socket服务器入口，用于umeng推送
├── package.json
├── routes #路由表
├── scripts #脚本
└── services #业务逻辑代码
```

## 日志格式
在`morgan('combined')`的基础上，将日期格式从`[:date[clf]]`改为`[:date[iso]]`，并新增加了`:response-time`这一列
```
:remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms
```
