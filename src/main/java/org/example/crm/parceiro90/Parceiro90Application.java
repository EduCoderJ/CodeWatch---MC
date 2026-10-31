package org.example.crm.parceiro90;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAsync
@EnableScheduling
@SpringBootApplication
public class Parceiro90Application {

    public static void main(String[] args) {
        SpringApplication.run(Parceiro90Application.class, args);
    }

}
