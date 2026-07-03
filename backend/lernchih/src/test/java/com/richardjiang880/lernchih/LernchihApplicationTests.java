package com.richardjiang880.lernchih;

import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

class LernchihApplicationTests extends AbstractIntegrationTest {

	@Test
	void contextLoads(ApplicationContext context) {
		assertThat(context).isNotNull();
		assertThat(context.getBean(LernchihApplication.class)).isNotNull();
	}

}
