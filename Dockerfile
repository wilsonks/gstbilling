# Spring Boot 3.5.0 Java 21 Dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /home/app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# ---------------------------------------------------
# Final Stage
# ---------------------------------------------------
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app
COPY --from=build /home/app/target/*.jar app.jar

EXPOSE 9100
ENTRYPOINT ["java", "-jar", "app.jar"]
