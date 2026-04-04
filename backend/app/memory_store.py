import asyncio

class InMemoryPubSub:
    def __init__(self):
        self.channels = {}

    def subscribe(self, channel_name: str):
        if channel_name not in self.channels:
            self.channels[channel_name] = set()
        
        queue = asyncio.Queue()
        self.channels[channel_name].add(queue)
        return queue

    def unsubscribe(self, channel_name: str, queue: asyncio.Queue):
        if channel_name in self.channels:
            self.channels[channel_name].discard(queue)

    async def publish(self, channel_name: str, message: str):
        if channel_name in self.channels:
            for queue in self.channels[channel_name]:
                await queue.put(message)

# Global singleton
pubsub_manager = InMemoryPubSub()
cache = {}

async def set_cache(key: str, value: str):
    cache[key] = value

async def get_cache(key: str):
    return cache.get(key)
