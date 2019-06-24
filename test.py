import pymysql
DB_host = '127.0.0.1'
#DB_host = 'tenglongroy.mysql.pythonanywhere-services.com'      #for pythonanywhere
DB_username = 'root'
DB_password = 'tenglong'
#DB_password = 'activity'       #for pythonanywhere
DataBase = 'test1'

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

conn = pymysql.connect(host=DB_host,
        user=DB_username,
        passwd=DB_password,
        charset='utf8mb4')
stmts = parse_sql('test.sql')
with conn.cursor() as cursor:
    for stmt in stmts:
        cursor.execute(stmt)
    conn.commit()