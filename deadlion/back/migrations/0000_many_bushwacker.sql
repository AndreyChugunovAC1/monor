CREATE TABLE `mots` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`descr` text,
	`asi` real NOT NULL,
	`owner` integer,
	`next_send` integer,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text(256) NOT NULL,
	`push_sub` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `users` (`email`);