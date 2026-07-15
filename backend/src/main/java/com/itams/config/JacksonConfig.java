package com.itams.config;

import com.fasterxml.jackson.core.StreamReadConstraints;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer customizer() {
        return builder -> {
            builder.postConfigurer(objectMapper -> {
                objectMapper.getFactory().setStreamReadConstraints(
                    StreamReadConstraints.builder().maxStringLength(100_000_000).build()
                );
            });
        };
    }
}
