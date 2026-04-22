package com.wecreate.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;

// Temporarily fix until adding database configuration
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class ApiSpringBootApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiSpringBootApplication.class, args);
    }

}
