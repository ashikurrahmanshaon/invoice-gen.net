CREATE TABLE `businessProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`nameBn` varchar(180),
	`email` varchar(320),
	`phone` varchar(40),
	`address` text,
	`addressBn` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businessProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_profiles_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`nameBn` varchar(180),
	`address` text,
	`addressBn` text,
	`phone` varchar(40),
	`email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`productId` int,
	`name` varchar(180) NOT NULL,
	`nameBn` varchar(180),
	`description` text,
	`descriptionBn` text,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`lineTotal` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoiceItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceStatusHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`userId` int NOT NULL,
	`previousStatus` enum('draft','sent','paid','overdue'),
	`status` enum('draft','sent','paid','overdue') NOT NULL,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoiceStatusHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`customerId` int NOT NULL,
	`invoiceNumber` varchar(80) NOT NULL,
	`issueDate` timestamp NOT NULL,
	`dueDate` timestamp,
	`status` enum('draft','sent','paid','overdue') NOT NULL DEFAULT 'draft',
	`subtotal` int NOT NULL DEFAULT 0,
	`taxRate` int NOT NULL DEFAULT 0,
	`taxAmount` int NOT NULL DEFAULT 0,
	`discountAmount` int NOT NULL DEFAULT 0,
	`totalAmount` int NOT NULL DEFAULT 0,
	`notes` text,
	`sentAt` timestamp,
	`paidAt` timestamp,
	`overdueAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_user_number_unique` UNIQUE(`userId`,`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(180) NOT NULL,
	`nameBn` varchar(180),
	`description` text,
	`descriptionBn` text,
	`unitPrice` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `customers_user_idx` ON `customers` (`userId`);--> statement-breakpoint
CREATE INDEX `invoice_items_invoice_idx` ON `invoiceItems` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `invoice_status_history_invoice_idx` ON `invoiceStatusHistory` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `invoices_user_idx` ON `invoices` (`userId`);--> statement-breakpoint
CREATE INDEX `invoices_customer_idx` ON `invoices` (`customerId`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `products_user_idx` ON `products` (`userId`);