#!/usr/bin/python
#-*- coding: UTF-8 -*-
from __future__ import unicode_literals
import os
import random

from time import gmtime, strftime, time
from datetime import datetime, timedelta

import pymysql, jwt
from flask import Flask, render_template, g, session, redirect, url_for, request, flash, jsonify
#from Android_API import android_api
import Android_API
from activity_model import check_auth

DB_host = 'tenglongroy.mysql.pythonanywhere-services.com'
DB_username = 'tenglongroy'
#DB_password = 'tenglong'
DB_password = 'activity'
DataBase = 'tenglongroy$activity_register'

#global NewsUpdatedTime
NewsDict = {}


app = Flask(__name__)
app.secret_key = os.urandom(24)
#app.register_blueprint(Android_API.android_api, url_prefix='/android')
app.register_blueprint(Android_API.android_api)


def getNews():
    try:
        newsFile = open('newsResult.txt', 'r', encoding='utf-8')
        NewsResult = newsFile.readline()
        NewsResult_cn = newsFile.readline()
        #lastUpdatedTime = int(float(newsFile.readline()))
        newsFile.close()
        if(len(NewsResult) < 1 or len(NewsResult_cn) < 1):
            print('result length < 1')
            return ""
        '''if( int(time()-lastUpdatedTime) >= 86400 ):  #news was 1 day ago, needs updated
            pass'''
        NewsDict = eval(NewsResult)
        NewsDict_cn = eval(NewsResult_cn)
        NewsDict['articles'].extend(NewsDict_cn['articles'])
        random.shuffle(NewsDict['articles'])
        return NewsDict['articles']
    except Exception as e:
        print('reading newsResult.txt error!'+ str(e))
        return
    '''if( int(time()-lastUpdatedTime) >= 86400 ):  #news was 1 day ago, needs updated
        lastUpdatedTime = time()
        return getNewsFromFile()
    else:
        return NewsDict'''
#news api
def getNewsFromFile():
    try:
        newsFile = open('newsResult.txt', 'r', encoding='utf-8')
        NewsResult = newsFile.readline()
        newsFile.close()
        if(len(NewsResult) < 1):
            return ""
        NewsDict = eval(NewsResult)
        return NewsDict
    except Error:
        return


#return current time in DataBase-format
def getCurTime():
    return strftime("%Y-%m-%d %H:%M:%S", gmtime())

#transform string-format date into DataBase-format date
def getDBformatTime(start_time):
    #input as 2018-01-01T01:01
    #output %Y-%m-%d %H:%M:%S
    return start_time[0:4]+'-'+start_time[5:7]+'-'+start_time[8:10]+' '+start_time[11:13]+':'+start_time[14:16]+':00'

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

def connect_db():
    '''if(not NewsUpdatedTime or NewsUpdatedTime == ""):
        NewsUpdatedTime = time()'''
    """Returns a new connection to the database."""
    return pymysql.connect(host=DB_host,
        user=DB_username,
        passwd=DB_password,
        db=DataBase,
        charset='utf8mb4')

@app.before_request
def before_request():
    session.permanent = True
    #31 days by default
    #app.permanent_session_lifetime = timedelta(minutes=5)
    """Make sure we are connected to the database each request."""
    g.db = connect_db()

@app.after_request
def after_request(response):
    """Closes the database again at the end of the request."""
    g.db.close()
    return response


@app.route('/', methods=['GET', 'POST'])
def show_activity_list():
    if request.method == 'GET':
        #activity_sql = """select * from activitylist where start_time >= '{0}'""".format(getCurTime())
        activity_sql = """select al.*, userlist.nickname from activitylist as al, userlist where al.maker_id=userlist.user_id"""
        with g.db as cur:
            cur.execute(activity_sql)
            act_list = [ dict(act_id=row[0], maker_id=row[1], title=row[2], min_participant=row[3], current_number=row[4],
                start_time=row[5], create_time=row[6], activity_type=row[7], description=row[8], nickname=row[9]) for row in cur.fetchall()]
            user_info = None
            join_list = None
            if session.get('logged_in'):
                user_info = getUserInfo(session.get('user_id', -1))
                join_list = getJoinedList(act_list, session.get('user_id', -1))
            #     user_sql = 'select username, nickname from userlist where user_id = {0}'.format(session.get('user_id'))
            #     cur.execute(user_sql)
            #     for row in cur.fetchall():
            #         user_info = [row[0], row[1]]    #username and nickname
            #         break
        return render_template('index.html', act_list=act_list, user_info=user_info, join_list=join_list, news_api=getNews())
    # else:   #POST
    #     title = request.form.get('title', "")
    #     min_participant = request.form.get('min_participant', 0)
    #     self_participate = request.form.get('self_participate', 0)    #0 for NO, 1 for YES
    #     start_time = request.form.get('start_time', '')
    #     with g.db as cur:
    #         sql = """insert into activitylist values (NULL, {0}, '{1}', {2}, {3}, '{4}', NOW())""".format(
    #             session['user_id'], title, min_participant, self_participate, start_time)
    #         app.logger.info(sql)
    #         cur.execute(sql)
    #     flash('You have add a new activity')
    #     return redirect(url_for('show_todo_list'))


#show every detail info, and show a 'DELETE' button if current user is the maker
@app.route('/activity/<activityID>', methods=['GET', 'POST'])
def show_specified_activity(activityID):
    if request.method == 'GET':
        join_sql = 'select * from joinlist where act_id = {0}'.format(activityID)
        activity_sql = '''select al.*, userlist.nickname from activitylist as al, userlist where al.act_id = {0} and
            al.maker_id = userlist.user_id'''.format(activityID)
        with g.db as cur:
            cur.execute(join_sql)
            join_list = [dict(transac_id=row[0], act_id=row[1], user_id=row[2], nickname=row[3], create_time=row[4]) for row in cur.fetchall()]
            #convert time string to time object to sort
            #join_list.sort(key=lambda item: datetime.strptime(item['create_time'], '%Y-%m-%d %H:%M:%S'))
            join_list.sort(key=lambda item: item['create_time'])
            cur.execute(activity_sql)
            for row in cur.fetchall():
                act_list = dict(act_id=row[0], maker_id=row[1], title=row[2], min_participant=row[3],
                   current_number=row[4], start_time=row[5], create_time=row[6], activity_type=row[7], description=row[8], nickname=row[9])
                break    #only 1 activity matches
            user_info = None
            user_act_flag = 0
            if session.get('logged_in'):
                userID = session.get('user_id', -1)
                user_info = getUserInfo(userID)
                for item in join_list:
                    if userID == item['user_id']:
                        user_act_flag = item['transac_id']
                        break
            if session.get('flash_act_message', ""):
                flash(session.pop('flash_act_message', None))
            return render_template('activity.html', act_list=act_list, join_list=join_list,
                user_info=user_info, user_act_flag=user_act_flag, news_api=getNews())


@app.route('/user/<userID>')
def show_user_profile(userID):
    old_join_sql = """select userlist.nickname, al.title, al.min_participant, al.current_number, al.start_time, al.activity_type,
        al.act_id from activitylist as al, joinlist, userlist where joinlist.user_id = {0} and al.act_id = joinlist.act_id and
        al.maker_id = userlist.user_id and al.start_time >= '{1}'""".format(userID, getCurTime())
    join_sql = """select userlist.nickname, al.title, al.min_participant, al.current_number, al.start_time, al.activity_type,
        al.act_id, joinlist.transac_id, al.maker_id, al.description from activitylist as al, joinlist, userlist
        where joinlist.user_id = {0} and al.act_id = joinlist.act_id and al.maker_id = userlist.user_id""".format(userID)
    maker_sql = "select * from activitylist where maker_id = {0}".format(userID)
    with g.db as cur:
        user_info = None
        if session.get('logged_in'):
            user_info = getUserInfo(session.get('user_id', -1))
        target_info = None
        if( userID != session.get('user_id', -1) ): #in case the userID is not the current logged-in user
            target_info = getUserInfo(userID)
        else:
            target_info = user_info

        cur.execute(join_sql)
        join_list = [dict(maker_name=row[0], title=row[1], min_participant=row[2], current_number=row[3], start_time=row[4],
            activity_type=row[5], act_id=row[6], transac_id=row[7], maker_id=row[8], description=row[9]) for row in cur.fetchall()]
        #join_list.sort(key=lambda item: datetime.strptime(item['start_time'], '%Y-%m-%d %H:%M:%S'))
        join_list.sort(key=lambda item: item['start_time'])

        #this can go private in the future, or even make it paid to see others' joined and created activities
        cur.execute(maker_sql)
        maker_list = [dict(act_id=row[0], maker_id=row[1], title=row[2], min_participant=row[3], current_number=row[4],
            start_time=row[5], create_time=row[6], activity_type=row[7], description=row[8]) for row in cur.fetchall()]

    #if session.get('flash_delete', ""):
    if session.get('flash_user_message', ""):
        flash(session.pop('flash_user_message', None))
    return render_template('user.html', user_info=user_info, target_info=target_info, join_list=join_list, maker_list=maker_list, news_api=getNews())


@app.route('/delete', methods=['GET', 'POST'])
def delete_activity():
    #print('---in delete')
    if request.method == 'POST':
        deleteID = request.form.get('delete', 0)
        if deleteID != 0:
            delete_act_sql = """delete from activitylist where act_id = {0}""".format(deleteID)
            delete_join_sql = """delete from joinlist where act_id = {0}""".format(deleteID)
            with g.db as cur:
                cur.execute(delete_act_sql)
                cur.execute(delete_join_sql)
                g.db.commit()
        if not session.get('logged_in'):    #not login, normally not possible
            return redirect(url_for('show_activity_list'))
        else:
            userID = session['user_id']
            session['flash_user_message'] = 'delete success'
            return redirect(url_for('show_user_profile', userID=userID))


@app.route('/create_activity', methods=['GET', 'POST'])
def create_activity():
    if request.method == 'GET' or not session.get('logged_in'): #just throw the visitor to main page
        return redirect(url_for('show_activity_list'))

    title = request.form.get('title', "")
    min_participant = request.form.get('min_participant', 0)
    self_participate = request.form.get('self_participate', 0)    #0 for NO, 1 for YES
    activity_type = request.form.get('activity_type', 'Others')
    start_time = request.form.get('start_time', '')
    formatted_time = getDBformatTime(start_time)
    userID = session['user_id']
    with g.db as cur:
        user_sql = "select nickname from userlist where user_id = {0}".format(userID)
        cur.execute(user_sql)
        nickname = cur.fetchall()[0][0]
        #print(session['user_id'], title, min_participant, formatted_time, activity_type)
        #if self_participate:   join it seperately
        create_sql = """insert into activitylist values (NULL, {0}, '{1}', {2}, 0, '{3}', NOW(), '{4}', NULL)""".format(
            userID, title, min_participant, formatted_time, activity_type)
        app.logger.info(create_sql)
        cur.execute(create_sql)
        #LAST_INSERT_ID()
        #SELECT MAX(id) FROM table1;    --alternatively
        getID_sql = 'select LAST_INSERT_ID()'
        cur.execute(getID_sql)
        last_insert_ID = 0
        for row in cur.fetchall():
            last_insert_ID = row[0]
            break
        if self_participate:
            #update_sql = '''update activitylist set current_number = current_number + 1 where act_id = LAST_INSERT_ID()'''
            update_sql = '''update activitylist set current_number = current_number + 1 where act_id = {0}'''.format(last_insert_ID)
            cur.execute(update_sql)
            #LAST_INSERT_ID() still available?
            #join_sql = '''insert into joinlist values(LAST_INSERT_ID(), {1}, '{2}', NOW())'''.format(userID, nickname)
            join_sql = """insert into joinlist values(NULL, {0}, {1}, '{2}', NOW())""".format(last_insert_ID, userID, nickname)
            cur.execute(join_sql)
        g.db.commit()

    flash('You have add a new activity')
    return redirect(url_for('show_specified_activity', activityID=last_insert_ID))


@app.route('/join_activity', methods=['GET', 'POST'])
def join_activity():
    print("--- in join_activity, method="+request.method)
    if request.method == 'POST':
        nickname = request.form.get('nickname', '')
        act_id = request.form.get('activity', 0)
        activity_sql = '''update activitylist set current_number = current_number + 1 where act_id = {0}'''.format(act_id)
        if not session.get('logged_in'):
            #put in database
            print('--- in joinvisitor')
            joinvisitor_sql = """insert into joinlist values(NULL, {0}, 0, '{1}', NOW())""".format(act_id, nickname)
            with g.db as cur:
                cur.execute(joinvisitor_sql)
                #update activity's current number
                cur.execute(activity_sql)
                g.db.commit()
        else:
            userID = session['user_id']
            update_user_sql = '''update userlist set nickname = '{0}' where user_id = {1}'''.format(nickname, userID)
            update_join_sql = """update joinlist set nickname = '{0}' where user_id = {1}""".format(nickname, userID)
            join_sql = '''insert into joinlist values(NULL, {0}, {1}, '{2}', NOW())'''.format(act_id, userID, nickname)
            with g.db as cur:
                cur.execute(join_sql)
                #update new nickname
                cur.execute(update_user_sql)
                cur.execute(update_join_sql)
                #update activity's current number
                cur.execute(activity_sql)
                g.db.commit()
        session['flash_act_message'] = "join activity success"
        return redirect(url_for('show_specified_activity', activityID=act_id))

def modify_activity():
    pass

@app.route('/kick', methods=['GET', 'POST'])
def kick_activity():
    act_id = request.form.get('kick_activity', 0)
    transac_id = request.form.get('kick_id', 0)
    delete_sql = """delete from joinlist where transac_id = {0}""".format(transac_id)
    update_sql = """update activitylist set current_number = current_number - 1 where act_id = {0}""".format(act_id)
    with g.db as cur:
        cur.execute(delete_sql)
        cur.execute(update_sql)
        g.db.commit()
        session['flash_act_message'] = "kick user success"
    return redirect(url_for('show_specified_activity', activityID=act_id))



@app.route('/quit_activity', methods=['GET', 'POST'])
def quit_activity():
    if not session.get('logged_in'):
        return redirect(url_for('show_activity_list'))

    userID = session.get('user_id', -1)
    transac_id = request.form.get('quit', 0)
    act_id = request.form.get('quit_activity', 0)
    activity_sql = """update activitylist set current_number = current_number - 1 where act_id = {0}""".format(act_id)
    join_sql = """delete from joinlist where transac_id = {0}""".format(transac_id)
    with g.db as cur:
        cur.execute(activity_sql)
        cur.execute(join_sql)
        #cur.commit()
        g.db.commit()
        cur.execute("select title from activitylist where act_id = {0}".format(act_id))
        for row in cur.fetchall():
            flash('successfully quit activity '+row[0])
            break;
    fromPage = request.form.get('fromPage', '')
    if fromPage == "user":    #coming from user, go back there
        return redirect(url_for('show_user_profile', userID=userID))
    return redirect(url_for('show_activity_list'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    #flag = 0
    if request.method == 'POST':
        if not request.form.get('username'):    #username not provided
            error = 'Invalid username'
            flash('Invalid username')
        else:
            user_id = check_auth(request.form['username'], request.form['password'])
            if user_id >= 0:
                session['logged_in'] = True
                session['user_id'] = user_id
                flash('you have logged in!')
                return redirect(url_for('show_activity_list'))
            else:
                error = 'Invalid username or password'
                flash('Invalid username or password')
    return render_template('login.html', error = error)

    """sql = 'select user_id, username, password from userlist'
            with g.db as cur:
                cur.execute(sql)
                for row in cur.fetchall():
                    if request.form['username'] == row[1]:
                        if request.form['password'] == row[2]:  #successful login
                            session['logged_in'] = True
                            session['user_id'] = row[0]
                            flash('you have logged in!')
                            return redirect(url_for('show_activity_list'))
                        else:   #password not correct
                            error = 'Invalid password'
                            flash('Invalid password')
                            flag = 1
                            break
                if flag == 0:   #username not found
                    error = 'Invalid username'
                    flash('Invalid username')
    return render_template('login.html', error = error)"""

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('user_id', None)
    flash('you have logout!')
    return redirect(url_for('login'))


@app.route('/toRegister')
def justGoToRegister():
    if session.get('registerError', ''):
        flash(session['registerError'])
        session.pop('registerError', None)
    return render_template('register.html')

@app.route('/register', methods=['GET', 'POST'])
def user_register():
    if request.method == 'POST':
        username = request.form.get('username', "")
        password = request.form.get('password', "")
        nickname = request.form.get('nickname', "")

        fetch_sql = """select user_id from userlist where username = '{0}'""".format(username)
        user_sql = """insert into userlist values(NULL, '{0}', '{1}', '{2}', NOW())""".format(username, password, nickname)
        with g.db as cur:
            cur.execute(fetch_sql)
            if len(cur.fetchall()) > 0:    #a record matches, refresh
                #return redirect(url_for('user_register'))
                #flash("username already exists")
                session['registerError'] = "username already exists"
                return redirect(url_for('justGoToRegister'))
            cur.execute(user_sql)
            #cur.commit()
            g.db.commit()
            flash("register successful")
            session['logged_in'] = True
            cur.execute(fetch_sql)
            session['user_id'] = cur.fetchall()[0][0]
        return redirect(url_for('show_activity_list'))

@app.route('/nickname_update', methods=['GET', 'POST'])
def nickname_update():
    if request.method == 'POST':
        new_nickname = request.form.get('new_nickname', "")
        userID = request.form.get('user_id', 0)
        update_user_sql = """update userlist set nickname = '{0}' where user_id = {1}""".format(new_nickname, userID)
        update_join_sql = """update joinlist set nickname = '{0}' where user_id = {1}""".format(new_nickname, userID)
        with g.db as cur:
            cur.execute(update_user_sql)
            cur.execute(update_join_sql)
            g.db.commit()
        session['flash_user_message'] = "nickname update success"
        return redirect(url_for('show_user_profile', userID=userID))

@app.route('/password_update', methods=['GET', 'POST'])
def password_update():
    if request.method == 'POST':
        password = request.form.get('new_password', "")
        userID = request.form.get('user_id', 0)
        update_user_sql = """update userlist set password = '{0}' where user_id = {1}""".format(password, userID)
        with g.db as cur:
            cur.execute(update_user_sql)
            g.db.commit()
        session['flash_user_message'] = "password update success"
        return redirect(url_for('show_user_profile', userID=userID))


def MelRandomNum(limit):
    return int(str(random.SystemRandom().random())[2:])%(limit+1)

@app.route('/melbournecup', methods=['GET', 'POST'])
def melbournecup():
    drawNum = MelRandomNum(24)
    while(drawNum == 11 or drawNum == 0):
        drawNum = MelRandomNum(24)
    return "<center id='melcup' style='padding-top: 10%;font-size: 2em;'><h3>lucky draw</h3> <h1>"+ str(drawNum) +"</h1></center>"

"""@app.route('/instagram', methods=['GET'])
def instagram():
    return "<script src='//lightwidget.com/widgets/lightwidget.js'></script><iframe src='//lightwidget.com/widgets/883c483df1ac5168b2d974cca0aec1b1.html' scrolling='no' allowtransparency='true' class='lightwidget-widget' style='width: 100%; border: 0; overflow: hidden;'></iframe>"
"""

@app.route('/image-gallery', methods=['GET'])
def image_gallery():
    return render_template("image-gallery-plugin.html",str=str)

#test python post json
@app.route('/test_python_post', methods=['GET', 'POST'])
def test_python_post():
    print("test_python_post")
    return jsonify({'response_type': 'test_python_post','check_token': 1}), 200

if __name__ == '__main__':
    tempFile = open('secret_key.dat', 'w')
    tempFile.write(str(app.secret_key))
    tempFile.close()
    #NewsUpdatedTime = time()
    #app.app_context().g.secret_key = app.secret_key
    """auth_token = encode_auth_token(2)
                print(auth_token)
                print(jwt.decode(auth_token, app.secret_key))"""
    app.run(host='0.0.0.0')

#delete the activities that expire 1 week
def regular_delete():
    pass
