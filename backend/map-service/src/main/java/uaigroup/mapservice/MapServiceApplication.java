package uaigroup.mapservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MapServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MapServiceApplication.class, args);
    }

}
