import { articles } from './src/data/articles';
import fs from 'fs';
fs.writeFileSync('server/posts.json', JSON.stringify(articles, null, 2));
