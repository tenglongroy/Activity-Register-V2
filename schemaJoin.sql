CREATE TABLE IF NOT EXISTS `joinlist` (
  `transac_id` int(11) NOT NULL AUTO_INCREMENT,
  `act_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT 0,
  `nickname` varchar(48) NOT NULL,
  `create_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`transac_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4;

insert into joinlist values(NULL, 1, 1, 'Roy', NULL), (NULL, 1, NULL, 'wtf', NULL), (NULL, 1, 4, 'tenglong', NULL);