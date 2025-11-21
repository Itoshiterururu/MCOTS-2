package uaigroup.mapservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.GeospatialIndex;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.Sort;

@Configuration
@EnableMongoRepositories(basePackages = "uaigroup.mapservice.repository")
@EnableMongoAuditing
public class MongoConfig {

    @Bean
    public CommandLineRunner createIndexes(MongoTemplate mongoTemplate) {
        return args -> {
            IndexOperations indexOps = mongoTemplate.indexOps("military_units");            
            // Create 2dsphere geospatial index for efficient location queries
            indexOps.ensureIndex(new GeospatialIndex("location"));
            
            // Create index on faction for filtering
            indexOps.ensureIndex(new Index().on("faction", Sort.Direction.ASC));
        };
    }
}