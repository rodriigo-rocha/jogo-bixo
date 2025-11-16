CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`pfp` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `bets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`draw_id` integer NOT NULL,
	`betor` text,
	`animal` text NOT NULL,
	`bet_type` text NOT NULL,
	`value` real NOT NULL,
	`number` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`draw_id`) REFERENCES `draws`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `bets` (`user_id`);--> statement-breakpoint
CREATE INDEX `draw_idx` ON `bets` (`draw_id`);--> statement-breakpoint
CREATE TABLE `draws` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`identifier` integer NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`closed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `draws_identifier_unique` ON `draws` (`identifier`);--> statement-breakpoint
CREATE INDEX `draw_user_idx` ON `draws` (`user_id`);--> statement-breakpoint
CREATE INDEX `draw_identifier_idx` ON `draws` (`identifier`);