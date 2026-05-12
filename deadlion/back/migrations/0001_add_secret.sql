PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_mots` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`descr` text,
	`asi` real NOT NULL,
	`owner` integer NOT NULL,
	`next_send` integer,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_mots`("id", "title", "descr", "asi", "owner", "next_send") SELECT "id", "title", "descr", "asi", "owner", "next_send" FROM `mots`;--> statement-breakpoint
DROP TABLE `mots`;--> statement-breakpoint
ALTER TABLE `__new_mots` RENAME TO `mots`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `users` ADD `secret` text;