# Whot Server

## An HTTP server serving a REST API for hosting Whot! games.

## Instructions

### Docker

#### Starting Containers

This project has been setup to use docker to create a development environment, so prepare to be dazzled. The readme assumes docker version >= 1.9.1 installed on your system.

The project contains bash scripts to simplify the interaction with docker and enable dynamic code changes. These can be found in
```
<project_root>/bin
```

To start up disposable containers use:

```
bin/start_disposable.sh
```

The command will attempt to start up containers based on a specific image. If the image cannot be found, it will be downloaded automatically.
If the project's image cannot be found, it will be built from the Dockerfile automatically.

When all is complete, you will be taken directly to the shell of the container with the application started for you.

At this point the app will be accessible with base url:

    http://localhost:32801


Thus your adventure begins...