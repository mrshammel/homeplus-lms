import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { Readable } from 'stream';

// Simple PPTX text extractor using built-in Node.js zip support
import { createReadStream } from 'fs';
import * as zlib from 'zlib';

// PPTX files are ZIP archives. We'll use the built-in decompress approach.
const dir = 'C:\\Users\\AmandaHammel\\Downloads\\Unit 1 - Lessons-20260505T180338Z-3-001\\Unit 1 - Lessons';

const files = readdirSync(dir).filter(f => f.endsWith('.pptx'));
console.log('Found PPTX files:', files);
console.log('Found video files:', readdirSync(dir).filter(f => f.endsWith('.mp4') || f.endsWith('.MP4')));
