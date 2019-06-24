/**
Python file activity_model.py will execute this file and initialise the database.
*/
DROP DATABASE IF EXISTS activity_register;
CREATE DATABASE activity_register CHARACTER SET 'utf8mb4';
USE activity_register;


/**
create user table if not exists
insert dummy data if table is empty
*/
CREATE TABLE IF NOT EXISTS `userlist` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(24) DEFAULT NULL,
  `password` varchar(24) DEFAULT NULL,
  `nickname` varchar(48) DEFAULT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into userlist (user_id, username, password, nickname, create_time, update_time)
(select NULL, 'tenglongroy', 'tenglong', 'Roy', now(), now()
  where not exists (select * from userlist)
) UNION ALL 
(select NULL, 'someoneA', 'someone', 'asdf', now(), now()
where not exists (select * from userlist)
) UNION ALL 
(select NULL, 'roytenglong', 'tenglong', 'roytenglong', now(), now()
where not exists (select * from userlist)
) UNION ALL 
(select NULL, 'tenglong', 'tenglong', 'tenglong', now(), now()
where not exists (select * from userlist));


/**
create activity table if not exists
insert dummy data if table is empty
*/
CREATE TABLE IF NOT EXISTS `activitylist` (
  `act_id` int(11) NOT NULL AUTO_INCREMENT,
  `maker_id` int(11) NOT NULL,
  `title` varchar(128) NOT NULL,
  `max_participant` int(4) NOT NULL,
  `min_participant` int(4) DEFAULT 1 COMMENT 'minimun population to make this activity happen',
  `start_time` datetime,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activity_type` varchar(128) NOT NULL DEFAULT 'board game',
  `description` LONGTEXT,
  `image_path` varchar(256) NOT NULL DEFAULT "",
  `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into activitylist (act_id, maker_id, title, max_participant, min_participant, start_time, create_time, activity_type, description, image_path, update_time)
(select 1, 1, 'Texas Holdem', 12, 6, now() + interval 7 day, now(), 'board game', "something simple testing", "", now()
  where not exists (select * from activitylist)
) UNION ALL 
(select 2, 2, 'Moore Park basketball', 16, 8, now() + interval 7 day, now(), 'Sports', "description testing basketball", "", now()
where not exists (select * from activitylist));


/**
create join table if not exists
insert dummy data if table is empty
-> This Join table is updated and has act_id and user_id BOTH as primary keys, remove transac_id (irrelevant) and add updated_time
*/
CREATE TABLE IF NOT EXISTS `joinlist` (
  `act_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_join` int(1) NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_id`, `user_id`),
  FOREIGN KEY (`act_id`) REFERENCES activitylist(`act_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES userlist(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into joinlist (act_id, user_id, is_join, create_time, update_time)
(select 1, 1, 1, now(), now()
  where not exists (select * from joinlist)
) UNION ALL
(select 2, 3, 1, now(), now()
  where not exists (select * from joinlist)
) UNION ALL
(select 2, 1, 1, now(), now()
  where not exists (select * from joinlist));

/**
create favourite table if not exists
insert dummy data if table is empty
*/
CREATE TABLE IF NOT EXISTS `favouritelist` (
  `act_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_favourite` int(1) NOT NULL DEFAULT 0,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_id`, `user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into favouritelist (act_id, user_id, is_favourite, create_time, update_time)
(select 1, 1, 1, now(), now()
  where not exists (select * from favouritelist)
) UNION ALL
(select 1, 3, 1, now(), now()
  where not exists (select * from favouritelist)
) UNION ALL
(select 1, 4, 1, now(), now()
  where not exists (select * from favouritelist));

/**
create activity image table if not exists
insert dummy data if table is empty
*/
--disgarded due to intergration into activitylist
CREATE TABLE IF NOT EXISTS `activityimagelist` (
  `act_id` int(11) NOT NULL,
  `image_path` int(11) NOT NULL DEFAULT "",
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into favouritelist (act_id, user_id, create_time, update_time)
(select 1, 1, now(), now()
  where not exists (select * from favouritelist)
) UNION ALL
(select 1, 3, now(), now()
  where not exists (select * from favouritelist)
) UNION ALL
(select 1, 4, now(), now()
  where not exists (select * from favouritelist));


/**
to modify insert following the syntax of activitylist
test in database
*/
CREATE TABLE IF NOT EXISTS `tokenlist` (
    `user_id` int(11) NOT NULL,
    `token` varchar(512) NOT NULL,
    `IP_address` varchar(24) DEFAULT NULL,
    `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into tokenlist (user_id, token, IP_address, create_time)
(select 1, 'asdf', NULL, now()
  where not exists (select * from tokenlist)
) UNION ALL 
(select 2, 'asdfaaa', NULL, now()
where not exists (select * from tokenlist));



/*TODO
to test
to add function in activity.html and app.py*/
CREATE TABLE IF NOT EXISTS `commentlist` (
  `act_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_id`, `user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;




/**
to modify insert following the syntax of activitylist
test in database
*/
--disgarded due to intergration into joinlist
CREATE TABLE IF NOT EXISTS `joinvisitorlist` (
  `act_id` int(11) NOT NULL,
  `nickname` varchar(48) NOT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_id`, `nickname`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into joinvisitorlist (act_id, nickname, create_time)
(select 1, 'wtf', now()
  where not exists (select * from joinvisitorlist)
)