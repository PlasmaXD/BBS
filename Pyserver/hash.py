import bcrypt

password = 'jun'
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(f"Generated hash: {hashed}")
is_valid = bcrypt.checkpw(password.encode('utf-8'), hashed)
print(f"Password is valid: {is_valid}")

import bcrypt

password = 'jun'
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(f"Generated hash for 'jun': {hashed}")

db.users.updateOne({ username: "jun" }, { $set: { password: "b'$2b$12$M1aZJugc5zN/YcdKxmcZqOEAOmEJU5yZoTP0O/fisf.uf.uzIQEFG'" } })
