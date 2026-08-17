CREATE TABLE `evox_module_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`actorId` int NOT NULL,
	`module` enum('turnover','vendor','obra') NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityId` int NOT NULL,
	`action` varchar(120) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evox_module_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `turnover_checklist_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`turnoverId` int NOT NULL,
	`label` varchar(180) NOT NULL,
	`status` enum('pending','done','skipped') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `turnover_checklist_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `turnover_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`turnoverId` int NOT NULL,
	`description` text NOT NULL,
	`fileUrl` varchar(2048),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `turnover_evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `turnover_incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`turnoverId` int NOT NULL,
	`description` text NOT NULL,
	`severity` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('open','resolved') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `turnover_incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `turnover_units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`zone` varchar(160) NOT NULL,
	`unitType` varchar(80) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `turnover_units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `turnovers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`unitId` int NOT NULL,
	`status` enum('planned','in_progress','released','cancelled') NOT NULL DEFAULT 'planned',
	`checkoutAt` timestamp,
	`checkinAt` timestamp,
	`releasedAt` timestamp,
	`releasedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `turnovers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `evox_module_events` ADD CONSTRAINT `evox_module_events_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evox_module_events` ADD CONSTRAINT `evox_module_events_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnover_checklist_items` ADD CONSTRAINT `turnover_checklist_items_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnover_checklist_items` ADD CONSTRAINT `turnover_checklist_items_turnoverId_turnovers_id_fk` FOREIGN KEY (`turnoverId`) REFERENCES `turnovers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnover_evidence` ADD CONSTRAINT `turnover_evidence_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnover_evidence` ADD CONSTRAINT `turnover_evidence_turnoverId_turnovers_id_fk` FOREIGN KEY (`turnoverId`) REFERENCES `turnovers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnover_incidents` ADD CONSTRAINT `turnover_incidents_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnover_incidents` ADD CONSTRAINT `turnover_incidents_turnoverId_turnovers_id_fk` FOREIGN KEY (`turnoverId`) REFERENCES `turnovers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnover_units` ADD CONSTRAINT `turnover_units_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnovers` ADD CONSTRAINT `turnovers_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnovers` ADD CONSTRAINT `turnovers_unitId_turnover_units_id_fk` FOREIGN KEY (`unitId`) REFERENCES `turnover_units`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `turnovers` ADD CONSTRAINT `turnovers_releasedByUserId_users_id_fk` FOREIGN KEY (`releasedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `module_events_owner_module_created_idx` ON `evox_module_events` (`ownerId`,`module`,`createdAt`);--> statement-breakpoint
CREATE INDEX `turnover_checklist_owner_turnover_idx` ON `turnover_checklist_items` (`ownerId`,`turnoverId`);--> statement-breakpoint
CREATE INDEX `turnover_evidence_owner_turnover_idx` ON `turnover_evidence` (`ownerId`,`turnoverId`);--> statement-breakpoint
CREATE INDEX `turnover_incidents_owner_turnover_idx` ON `turnover_incidents` (`ownerId`,`turnoverId`);--> statement-breakpoint
CREATE INDEX `turnover_units_owner_updated_idx` ON `turnover_units` (`ownerId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `turnovers_owner_unit_status_idx` ON `turnovers` (`ownerId`,`unitId`,`status`);