package com.wecreate.api.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GsonConfig {

    @Bean
    public Gson gson() {
        // We use GsonBuilder to ensure it handles complex date formats
        // and pretty-printing if you ever need to debug logs.
        return new GsonBuilder()
                .setPrettyPrinting()
                .serializeNulls() // Optional: keeps null fields in the JSON if you want
                .create();
    }
}