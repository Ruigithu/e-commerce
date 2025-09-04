FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 直接复制预构建的 jar 文件
COPY target/*.jar app.jar

# 设置 JVM 参数
ENV JAVA_OPTS="-Xmx512m -Xms256m"

EXPOSE 8761

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]