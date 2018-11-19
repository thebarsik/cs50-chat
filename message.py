
class Message:
    def __init__(self, timestamp, owner, message):
        self.timestamp = timestamp
        self.owner = owner
        self.message = message

    def __get__(self):
        """
        Returns dictionary of the message in form:
        {timestamp, username, message}
        """
        context = {"timestamp":self.timestamp, "username": self.owner, "message": self.message}
        return context

    def __delete__(self):
        del self

    def toString(self):
        return str(f"{self.timestamp} - {self.owner} : {self.message}")



        