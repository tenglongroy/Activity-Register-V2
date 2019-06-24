import pymysql, json
from flask import Flask, render_template, g, session, redirect, url_for, request, flash, jsonify


DB_host = '127.0.0.1'
#DB_host = 'tenglongroy.mysql.pythonanywhere-services.com'      #for pythonanywhere
DB_username = 'root'
DB_password = 'tenglong'
#DB_password = 'activity'       #for pythonanywhere
DataBase = 'activity_register'
#DataBase = 'tenglongroy$activity_register'     #for pythonanywhere


#check if username and password correct
def check_auth(username, password):
    sql = 'select user_id, nickname from userlist where username = "{0}" and password = "{1}"'.format(username, password)
    with g.db as cur:
        cur.execute(sql)
        result = cur.fetchall()
        if len(result) > 0:         #match, login successful
            return result     #user_id
        else:
            return None       #didn't find match

#return the user information with username
def get_user(username):
    sql = 'select user_id, username, nickname, create_time from userlist where username = "{0}"'.format(username)
    with g.db as cur:
        cur.execute(sql)
        result = cur.fetchall()
        if len(result) > 0:         #match, login successful
            return result     #user_id
        else:
            return None       #didn't find match

#???
#check if the curretn token expires or the account login from somewhere else and thus new token generated
def check_token(user_id, token):
    #sql = 'select * from tokenlist where user_id = {0}'.format(user_id, token)
    sql = 'select * from tokenlist where user_id = {0}'.format(user_id)
    with g.db as cur:
        cur.execute(sql)
        result = cur.fetchall()
        if len(result) > 0:     #user_id found, check token match
            if result[0][1] == token:
                return 1        #token match
            else:
                return 0        #token not match, already login somewhere else, need to login again
        else:   
            return -1           #user_id not found, first login

#save the created token into database
def save_token(user_id, token, IP):
    sql = '''insert into tokenlist values ({0}, "{1}", "{2}", now()) ON DUPLICATE KEY UPDATE 
                token = "{1}", IP_address = "{2}"'''.format(user_id, token, IP)
    with g.db as cur:
        cur.execute(sql)
        g.db.commit()
    return





#return a list of dictionaries of user
def getUserInfo(userID):
    user_info = None
    user_sql = 'select user_id, username, nickname, create_time from userlist where user_id = {0}'.format(userID)
    with g.db as cur:
        cur.execute(user_sql)
        user_info = [dict(user_id=row[0], username=row[1], nickname=row[2], create_time=row[3]) for row in cur.fetchall()]
        #print(user_info)
    #can use fetchone()
    return user_info[0]

#do a cross match on a list of activities with one user
#return a list of 0/1 indicating whether this user joins the corresponding activity
def getJoinedList(act_list, user_id):
    joined_list = []
    for item in act_list:
        join_sql = '''select * from joinlist where joinlist.act_id={0} and joinlist.user_id={1}'''.format(item['act_id'], user_id)
        with g.db as cur:
            cur.execute(join_sql)
            tempFetch = cur.fetchall()
            if len(tempFetch) > 0:     #user joined this activity
                #joined_list.append(1)
                joined_list.append(tempFetch[0][0])     #append transac_id
            else:
                joined_list.append(0)
    return joined_list


#return a list of activity info and its maker's username and id
def getActivityList():
    activity_sql = """select al.*, userlist.nickname from activitylist as al, userlist where al.maker_id=userlist.user_id"""
    with g.db as cur:
        cur.execute(activity_sql)
        act_list = [ dict(act_id=row[0], maker_id=row[1], title=row[2], min_participant=row[3], current_number=row[4], 
            start_time=row[5], create_time=row[6], activity_type=row[7], nickname=row[8]) for row in cur.fetchall()]
    return act_list


def parse_sql(filename):
    #http://adamlamers.com/post/GRBJUKCDMPOA
    data = open(filename, 'r').readlines()
    stmts = []
    DELIMITER = ';'
    stmt = ''

    for lineno, line in enumerate(data):
        if not line.strip():
            continue

        if line.startswith('--'):
            continue

        if 'DELIMITER' in line:
            DELIMITER = line.split()[1]
            continue

        if (DELIMITER not in line):
            stmt += line.replace(DELIMITER, ';')
            continue

        if stmt:
            stmt += line
            stmts.append(stmt.strip())
            stmt = ''
        else:
            stmts.append(line.strip())
    return stmts

def _initDB():
    #python will parse all sql commands in shemaINIT.sql and put them in pymysql to execute
    conn = pymysql.connect(host=DB_host,
        user=DB_username,
        passwd=DB_password,
        charset='utf8mb4')
    stmts = parse_sql('schemaINIT.sql')
    with conn.cursor() as cursor:
        for stmt in stmts:
            cursor.execute(stmt)
        conn.commit()


#if first time initialise, run this python file to create everything (database, table and dummy data) in MySQL
#remember to change the database details at the beginning of this file to match the app.py file
if __name__ == '__main__':
    _initDB()