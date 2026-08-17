CREATE TABLE `service_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`vendorId` int,
	`title` varchar(180) NOT NULL,
	`location` varchar(240) NOT NULL,
	`description` text NOT NULL,
	`status` enum('draft','pending_visit','quoted','scheduled','completed','cancelled') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_vendors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`category` varchar(120) NOT NULL,
	`phone` varchar(40),
	`contactEmail` varchar(320),
	`notes` text,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_vendors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_quotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`requestId` int NOT NULL,
	`vendorId` int NOT NULL,
	`description` text NOT NULL,
	`amountCents` int NOT NULL,
	`evidenceUrl` varchar(2048),
	`status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
	`decidedByUserId` int,
	`decidedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendor_quotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `service_requests` ADD CONSTRAINT `service_requests_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_requests` ADD CONSTRAINT `service_requests_vendorId_service_vendors_id_fk` FOREIGN KEY (`vendorId`) REFERENCES `service_vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_vendors` ADD CONSTRAINT `service_vendors_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_quotes` ADD CONSTRAINT `vendor_quotes_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_quotes` ADD CONSTRAINT `vendor_quotes_requestId_service_requests_id_fk` FOREIGN KEY (`requestId`) REFERENCES `service_requests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_quotes` ADD CONSTRAINT `vendor_quotes_vendorId_service_vendors_id_fk` FOREIGN KEY (`vendorId`) REFERENCES `service_vendors`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendor_quotes` ADD CONSTRAINT `vendor_quotes_decidedByUserId_users_id_fk` FOREIGN KEY (`decidedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `service_requests_owner_status_idx` ON `service_requests` (`ownerId`,`status`);--> statement-breakpoint
CREATE INDEX `service_requests_owner_vendor_idx` ON `service_requests` (`ownerId`,`vendorId`);--> statement-breakpoint
CREATE INDEX `service_vendors_owner_status_idx` ON `service_vendors` (`ownerId`,`status`);--> statement-breakpoint
CREATE INDEX `vendor_quotes_owner_request_status_idx` ON `vendor_quotes` (`ownerId`,`requestId`,`status`);