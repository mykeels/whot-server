# Use Node Base image 
FROM node:8.6.0

# create the log directory
RUN mkdir -p /var/log/applications/whotserver

# Creating base "src" directory where the source repo will reside in our container.
# Code is copied from the host machine to this "src" folder in the container as a last step.
RUN mkdir /src
WORKDIR /src

# Copy package.json into the container and install node modules
COPY ./package.json /src

# Install node dependencies
RUN npm install

# Copy entire file to docker
COPY . /src

# Map a volume for the log files and add a volume to override the code
VOLUME ["/src", "/var/log/applications/whotserver"]

# Expose web service and nodejs debug port
EXPOSE  8800 8585 9615