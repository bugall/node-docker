### 软件
1. 需要安装docker
2. 本机需要启动mongodb

### 启动
npm start

### 运行步骤
1. 下载镜像: 默认镜像地址是在`www.daocloud.io`中

```
 GET http://localhost:3000/docker/image/pull?name=node&version=7.7.4-v4&repo=daocloud.io/bugall_test


 name: 表示镜像的名字
 version: 表示镜像的版本号
 repo: 表示镜像的仓库地址

 此镜像中预先存放了一个简单的http项目,会连接数据库并插入数据, 项目中db的配置是通过容器的环境变量传递的

 ```

 ```
 const db = mongoose.createConnection(`mongodb://${process.env.db_host}:${process.env.db_port}/${process.env.db_name}`);
 ```

2. 创建一个项目的容器
```
POST http://localhost:3000/project/p100001

body = {
    image: daocloud.io/bugall_test/node:7.7.4-v5,
    processEnv: ["db_host=172.17.0.5", "db_port=27017","db_name=p100007"],
    diskLimit: 500 // 500M
    sharedFolder: ["/User/bugall:/var/www/file"] // 共享，容器中/var/www/file 文件会出现在宿主机 /User/bugall中
}
```
容器默认只暴露3000端口
宿主机与容器的端口映射是自动生成的并保存的,存储在mongo中的container表中

接口返回成功后, docker ps -a查看容器是否启动正常,查看容器映射宿主机的端口号,例如: 0.0.0.0:10005->3000/tcp在宿主机中执行命令
```
curl localhost:10005
```
如果有返回数据表示容器正常

3. 停止一个项目的容器
```
GET localhost:3000/project/stop/p100005
```

4. 启动一个项目的容器
```
GET localhost:3000/project/start/p100005
```

5. 备份一个容器
```
GET localhost:3000/project/backup/p100005?name=backup&version=0.0.1

name: 表示镜像的名字
version: 表示镜像的版本号
```
