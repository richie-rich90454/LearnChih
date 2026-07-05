package com.richardjiang880.lernchih;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class LernchihApplication {

	private static final Logger log = LoggerFactory.getLogger(LernchihApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(LernchihApplication.class, args);
	}

	@Bean
	public CommandLineRunner startupUrlLogger(@Value("${server.port}") String port) {
		return args -> log.info("Website running on: http://localhost:{}", port);
	}

}
