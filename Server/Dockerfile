FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src/ src/
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S bodega && adduser -S bodega -G bodega

WORKDIR /app
RUN mkdir -p /app/logs && chown -R bodega:bodega /app

COPY --from=builder /build/target/*.jar bodega.jar

USER bodega

EXPOSE 8080
VOLUME ["/app/logs"]

ENTRYPOINT ["java", "-jar", "/app/bodega.jar"]
