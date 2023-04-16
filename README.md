
# todos

* Q: how ui gotta rendered?
    * A: rendering using SPA
* Q: how fuzzy search logs
    * lib/src/common/services/clickhouse/clickhouse.service.ts 
    * it don't support fuzzy search for logs or Incidents
    * 

* nestjs passport
    * https://docs.nestjs.com/recipes/passport#customize-passport
* react form - https://react-hook-form.com/get-started/#Quickstart

* pg database 
    * relay-worker/src/db/database.ts - raw operation through pg driver/client



# Notes

* error handling

this try/catch pattern is so pervasive, it's good practice to use annotation to abstract this
repeatness away. since typescript don't support macro
```
  public async getPaginateApiListDto(query: QUERY): Promise<ApiResponse<PaginateType<ENTITY>>> {
    try {
      const response = await this.listDto(query);
      return new ApiResponse("success", undefined, response);
    } catch (error) {
      throw new InternalServerError(error);
    }
  }
```


* db pattern

```
    await clickhouse.query({
        query: 'SELECT 1'
    }).catch((err) => {
        logger.error(err);
        ExceptionHandlers.catchException(`❌ Cannot connect to Clickhouse instance. Caused by: ${err}`);

        throw err;
    });

```

* gracefully exit

```

    process.on('beforeExit', async () => await onShutdown());

    // https://www.baeldung.com/linux/sigint-and-other-termination-signals
    process.on('SIGINT', async () => await onShutdown());
    process.on('SIGTERM', async () => await onShutdown());
    process.on('SIGHUP', async () => await onShutdown());
```

* webpack config

```
    optimization: {
      moduleIds: "named",
      runtimeChunk: true,
      removeAvailableModules: false,
      removeEmptyChunks: true,
      splitChunks: false,
      usedExports: true,
      minimizer: ["...", new CssMinimizerPlugin()]
    },

```


## socket io


### server
-> lib/src/api/incidents/incident-comments/incident-comments.service.ts
```
      this.live.publish(projectId, {
        action: "new_comment",
        message: comment
      });
```


-> lib/src/common/services/live.service.ts

```

// config
@WebSocketGateway({
  cors: {
    origin: process.env.APP_ORIGIN
  }
})
export class LiveService {


// publish
    this.server.to(`ws:${projectId}`).emit(data.action, data.message);
```


### client
-> public/packages/app/src/core/contexts/LiveContextProvider.tsx

```
// connect to server
  const socket = useRef(
    io(SOCKET_URL, {
      transports: ["websocket"]
    })
  );

  useEffect(() => {
    socket.current.on("disconnect", removeConnection);

    return () => {
      if (socket && socket.current) {
        removeConnection();
      }
    };
  }, []);
```


-> public/packages/app/src/core/hooks/useLive.tsx
add hooks

```
// hooks provides
  return {
    subscribe,
    emit,
    listen
  };
```

-> public/packages/app/src/core/components/Layout/Wrappers/ProjectDashboardWrapper.tsx
this is common layout for all pages. (this part seems optional, there's no usage for `socket.emit("subscribe_app", { id })`)
        
subscribe each project

```

  useEffect(() => {
    live.subscribe(id); // id is projectId
  }, []);
```



-> public/packages/app/src/features/project/incidents/IncidentConversationPage.tsx
```
  live.listen("new_comment", (comment: IComment) => {
    dispatch(setIncidentComments([...comments, comment]));
  });

```

# Traceo
Traceo is an open-source, self-hosted set of tools for monitoring application health by collecting and aggregating data from the software. 

# Development status
Not ready for production use.

<!-- Estimated release time for the production-ready version (1.0.0): 01.05.2023 -->

# SDK
To start using the Traceo platform, you need to integrate with [Traceo SDK](https://github.com/traceo-io/traceo-node). Informations about the process of implementation SDK inside your software is in README of the each SDK.
- [`@traceo-sdk/node`](https://github.com/traceo-dev/traceo-sdk/tree/develop/packages/node) - NodeJS
- [`@traceo-sdk/react`](https://github.com/traceo-dev/traceo-sdk/tree/develop/packages/react) - React
- [`@traceo-sdk/vue`](https://github.com/traceo-dev/traceo-sdk/tree/develop/packages/vue) - Vue


# Installation
At this point, the installation of the Traceo platform is done by using the docker image.

To pull or run already existing docker image:
```
docker run -d --name=traceo -p 3000:3000 traceo/traceo
```

The application will be available at http://localhost:3000.

The default user is `admin/admin`. 

If you want to use a custom `port` then you should use:
```
docker run -d --name=traceo -p <port>:3000 traceo/traceo
```

### ***Database***
By default, Traceo Platform uses the SQLite database. Once the container is stopped, all your data will be deleted. To avoid this, create a docker volume and mount it at application startup.
```
docker volume create traceo-volume

docker run -d --name=traceo -v traceo-volume:/usr/traceo -p 3000:3000 traceo/traceo
```

If you want to integrate with the PostgreSQL database you have to set the environment variables as below:

```
docker run \
  -d -p 3000:3000 \
  -e PG_HOST="POSTGRES_HOST" \
  -e PG_PORT="POSTGRES_PORT" \
  -e PG_DB_NAME="POSTGRSES_DB_NAME" \
  -e PG_PASS="POSTGRES_PASSWORD" \
  -e PG_USER="POSTGRES_USER" \
  --name=traceo \
  traceo/traceo
```
# Features
### ***Incidents capture***
Capture all exceptions and errors occurs in your software. Each incident is unique and if another incident of the same type occurs, then it is grouped with the first one. 

<p align="center">
  <img src="https://github.com/traceo-io/traceo/raw/develop/.github/screenshots/traceo-incidents-list.PNG" width="400">
  <img src="https://github.com/traceo-io/traceo/raw/develop/.github/screenshots/traceo-incident-preview.PNG" width="400">
</p>

### ***Logs analysis***
Monitor all the important and sensitive places in your software, recording the relevant information, which is then sent to Traceo so that you can later efficiently search for the information you need.

<img src="https://github.com/traceo-io/traceo/raw/develop/.github/screenshots/traceo-logs.PNG">

### ***Metrics***
Record data about your server, like eq. CPU utilization or RAM usage.

<img src="https://github.com/traceo-io/traceo/raw/develop/.github/screenshots/traceo-metrics.PNG">

### ***Performance (v. > 1.0.0)***
Control the performance of your application by collecting web-vitals data from your browser.

<p align="center">
  <img src="https://github.com/traceo-io/traceo/raw/develop/.github/screenshots/traceo-web-perf-list.PNG" width="400">
  <img src="https://github.com/traceo-io/traceo/raw/develop/.github/screenshots/traceo-web-perf.PNG" width="400">
</p>

# Support

Feel free to create Issues or Pull Request.

# License

Traceo is licensed under the [Apache License, Version 2.0](https://github.com/traceo-dev/traceo/blob/main/LICENSE).
