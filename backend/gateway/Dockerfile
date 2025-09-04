FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE ${PORT:-8080}
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]
