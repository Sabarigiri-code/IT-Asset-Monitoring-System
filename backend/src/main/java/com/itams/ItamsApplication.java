package com.itams;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ItamsApplication {

	public static void main(String[] args) {
		SpringApplication.run(ItamsApplication.class, args);
	}

}
