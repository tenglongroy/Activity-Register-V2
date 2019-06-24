CREATE TABLE IF NOT EXISTS `activitylist` (
  `act_id` int(11) NOT NULL AUTO_INCREMENT,
  `maker_id` int(11) NOT NULL,
  `title` varchar(128) NOT NULL,
  `min_participant` int(4) NOT NULL COMMENT 'minimun population to make this activity happen',
  `current_number` int(4) NOT NULL DEFAULT 0,
  `start_time` datetime,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activity_type` varchar(128) NOT NULL DEFAULT 'board game',
  PRIMARY KEY (`act_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into activitylist values(NULL, 1, '跨年狼人杀', 12, 3, '2016-12-31 19:00:00', NULL, 'board game'), (NULL, 2, 'Moore Park 打球', 8, 0, '2017-02-20 16:00:00', NULL, 'Sports');