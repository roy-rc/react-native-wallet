import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    try {
        const { success } = await ratelimit.limit("MY-RATE-LIMITER-KEY");
        //const { success } = await ratelimit.limit(req.ip); // you can also use req.ip to limit by IP address
        if (!success) {
            return res.status(429).json({ error: 'Too many requests' });
        }
        next();
    } catch (error) {
        console.error('Rate limiting error:', error);
        res.status(500).json({ error: 'Internal server error' });
        next(error)
    }
}

export default rateLimiter;