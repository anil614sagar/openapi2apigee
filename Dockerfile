FROM node:alpine

# Create app directory
WORKDIR /usr/src/app

# Please update .dockerignore if you see unnecessary files being copied as Docker build context. 
# Anything above 541k in docker build context size is probably something that needs to be ignored.
COPY . .

RUN npm install && \
    node bin/openapi2apigee --help

ENV APIGEE_ORG= \
    APIGEE_USER_ID= \
    APIGEE_USER_PASSWORD= \
    APIGEE_PROXY_NAME= \
    OPEN_API= \ 
    SERVICE_ENDPOINT_URL= \
    APIGEE_BASE_URL=https://api.enterprise.apigee.com \
    APIGEE_ENVIRONMENTS=test \
    APIGEE_VIRTUAL_HOSTS=default,secure

CMD node ./bin/openapi2apigee \
        ${APIGEE_PROXY_NAME} \
        -o ${APIGEE_ORG} \
        -u ${APIGEE_USER_ID} \
        -p ${APIGEE_USER_PASSWORD} \
        -s ${OPEN_API} \
        -d /usr/tmp \
        -t ${SERVICE_ENDPOINT_URL} \
        -e ${APIGEE_ENVIRONMENTS} \
        -v ${APIGEE_VIRTUAL_HOSTS} \
        -b ${APIGEE_BASE_URL} \
        -D

