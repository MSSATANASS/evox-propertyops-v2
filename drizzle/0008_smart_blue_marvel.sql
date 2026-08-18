CREATE TABLE `tour_departures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`routeLabel` varchar(240) NOT NULL,
	`guideId` int,
	`departureAt` timestamp,
	`status` enum('draft','ready','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`statusChangedByUserId` int,
	`statusChangedAt` timestamp,
	`cancellationReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tour_departures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tour_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`actorId` int NOT NULL,
	`departureId` int,
	`entityType` varchar(80) NOT NULL,
	`entityId` int NOT NULL,
	`action` varchar(120) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tour_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tour_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`departureId` int NOT NULL,
	`description` text NOT NULL,
	`fileUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tour_evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tour_guides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`phone` varchar(40),
	`notes` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tour_guides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tour_incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`departureId` int NOT NULL,
	`description` text NOT NULL,
	`severity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('open','resolved') NOT NULL DEFAULT 'open',
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tour_incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tour_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`departureId` int NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`partySize` int NOT NULL DEFAULT 1,
	`status` enum('registered','cancelled','checked_in') NOT NULL DEFAULT 'registered',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tour_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tour_stops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`departureId` int NOT NULL,
	`sequence` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`notes` text,
	`scheduledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tour_stops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tour_departures` ADD CONSTRAINT `tour_departures_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_departures` ADD CONSTRAINT `tour_departures_guideId_tour_guides_id_fk` FOREIGN KEY (`guideId`) REFERENCES `tour_guides`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_departures` ADD CONSTRAINT `tour_departures_statusChangedByUserId_users_id_fk` FOREIGN KEY (`statusChangedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_events` ADD CONSTRAINT `tour_events_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_events` ADD CONSTRAINT `tour_events_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_events` ADD CONSTRAINT `tour_events_departureId_tour_departures_id_fk` FOREIGN KEY (`departureId`) REFERENCES `tour_departures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_evidence` ADD CONSTRAINT `tour_evidence_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_evidence` ADD CONSTRAINT `tour_evidence_departureId_tour_departures_id_fk` FOREIGN KEY (`departureId`) REFERENCES `tour_departures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_guides` ADD CONSTRAINT `tour_guides_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_incidents` ADD CONSTRAINT `tour_incidents_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_incidents` ADD CONSTRAINT `tour_incidents_departureId_tour_departures_id_fk` FOREIGN KEY (`departureId`) REFERENCES `tour_departures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_participants` ADD CONSTRAINT `tour_participants_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_participants` ADD CONSTRAINT `tour_participants_departureId_tour_departures_id_fk` FOREIGN KEY (`departureId`) REFERENCES `tour_departures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_stops` ADD CONSTRAINT `tour_stops_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tour_stops` ADD CONSTRAINT `tour_stops_departureId_tour_departures_id_fk` FOREIGN KEY (`departureId`) REFERENCES `tour_departures`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `tour_departures_owner_status_date_idx` ON `tour_departures` (`ownerId`,`status`,`departureAt`);--> statement-breakpoint
CREATE INDEX `tour_events_owner_departure_created_idx` ON `tour_events` (`ownerId`,`departureId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `tour_evidence_owner_departure_idx` ON `tour_evidence` (`ownerId`,`departureId`);--> statement-breakpoint
CREATE INDEX `tour_guides_owner_status_idx` ON `tour_guides` (`ownerId`,`status`);--> statement-breakpoint
CREATE INDEX `tour_incidents_owner_departure_status_idx` ON `tour_incidents` (`ownerId`,`departureId`,`status`);--> statement-breakpoint
CREATE INDEX `tour_participants_owner_departure_status_idx` ON `tour_participants` (`ownerId`,`departureId`,`status`);--> statement-breakpoint
CREATE INDEX `tour_stops_owner_departure_sequence_idx` ON `tour_stops` (`ownerId`,`departureId`,`sequence`);