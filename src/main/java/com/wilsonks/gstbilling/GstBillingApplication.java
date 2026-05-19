package com.wilsonks.gstbilling;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ConfigurationPropertiesScan
@Slf4j
public class GstBillingApplication {

	public static void main(String[] args) {
		SpringApplication.run(GstBillingApplication.class, args);
	}

	@Bean
	ApplicationRunner init() {
		return args -> {
			log.info("GST Billing Application V1.0.0 Started");
		};
	}

}
