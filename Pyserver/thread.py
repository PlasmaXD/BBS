# thread.py
import datetime
from bson import ObjectId

class Thread:
    def __init__(self, db):
        self.db = db

    def create_thread(self, title, description):
        thread_id = self.db.threads.insert_one({
            'title': title,
            'description': description,
            'created_at': datetime.datetime.utcnow()
        }).inserted_id
        return str(thread_id)

    def get_threads(self):
        threads = self.db.threads.find()
        return [{'_id': str(thread['_id']), 'title': thread['title'], 'description': thread['description'], 'created_at': thread['created_at']} for thread in threads]

    def get_thread(self, thread_id):
        thread = self.db.threads.find_one({'_id': ObjectId(thread_id)})
        return {'_id': str(thread['_id']), 'title': thread['title'], 'description': thread['description'], 'created_at': thread['created_at']}
