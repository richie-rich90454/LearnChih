package com.richardjiang880.opensolutions;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OpensolutionsApplication {

	public static void main(String[] args) {
		SpringApplication.run(OpensolutionsApplication.class, args);
	}

}
