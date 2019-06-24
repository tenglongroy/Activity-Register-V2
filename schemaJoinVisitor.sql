--disgarded due to intergration into joinlist
CREATE TABLE IF NOT EXISTS `joinvisitorlist` (
  `act_id` int(11) NOT NULL,
  `nickname` varchar(48) NOT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`act_id`, `nickname`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into joinvisitorlist values(1, 'wtf', NULL);