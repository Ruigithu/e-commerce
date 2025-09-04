FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /build

# 复制父项目的 pom.xml
COPY ../pom.xml ./pom.xml
# 复制 gateway 的 pom.xml
COPY pom.xml ./gateway/pom.xml

# 设置工作目录到 gateway
WORKDIR /build/gateway

# 下载依赖
RUN mvn dependency:go-offline

# 复制源代码
COPY src ./src

# 构建
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
ENV JAVA_OPTS="-Xmx512m -Xms256m"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
