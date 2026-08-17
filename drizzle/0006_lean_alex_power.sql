CREATE TABLE `turnover_discovery_candidates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`source` enum('google_places') NOT NULL,
	`query` varchar(320) NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`name` varchar(240) NOT NULL,
	`address` text,
	`mapsUrl` varchar(2048),
	`websiteUrl` varchar(2048),
	`category` varchar(160),
	`latitude` varchar(32),
	`longitude` varchar(32),
	`status` enum('discovered','reviewed','dismissed') NOT NULL DEFAULT 'discovered',
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `turnover_discovery_candidates_id` PRIMARY KEY(`id`),
	CONSTRAINT `turnover_discovery_owner_source_external_unique` UNIQUE(`ownerId`,`source`,`externalId`)
);
--> statement-breakpoint
ALTER TABLE `turnover_discovery_candidates` ADD CONSTRAINT `turnover_discovery_candidates_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `turnover_discovery_owner_status_created_idx` ON `turnover_discovery_candidates` (`ownerId`,`status`,`createdAt`);