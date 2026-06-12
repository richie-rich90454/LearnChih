package com.richardjiang880.lernchih;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LernchihApplication {

	public static void main(String[] args) {
		SpringApplication.run(LernchihApplication.class, args);
	}

}
