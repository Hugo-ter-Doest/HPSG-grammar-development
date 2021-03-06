/**
 * Created by hugo on 16-12-15.
 */

var log4js = require('log4js');
var logger = log4js.getLogger();

var fs = require('fs');

var chartParsers = require('../chart-parsers');

var base = './data/';
var signatureFile = base + 'DU_Signature.txt';
var lexiconFile = base + 'DU_Lexicon.txt';
var grammarFile = base + 'DU_Grammar.txt';
var sentencesFile = base + 'DU_Sentences.txt';
var resultsFile = base + 'DU_Results.txt';

// Load signature
var text = fs.readFileSync(signatureFile, 'utf8');
var signature = chartParsers.SignatureParser.parse(text, {
  implicitTypes:false,
  appropriateTypes: true,
  appropriateFeatures: true,
  completeAndAppropriateFeatures: false
});

// Load lexicon
text = fs.readFileSync(lexiconFile, 'utf8');
var lexicon = chartParsers.LexiconParser.parse(text, {
  signature: signature
});

// Load grammar
text = fs.readFileSync(grammarFile, 'utf8');
var grammar = chartParsers.GrammarParser.parse(text, {
  signature: signature
});

// Create parser
var parserFactory = new chartParsers.ParserFactory();
parser = parserFactory.createParser({
  type: 'LeftCorner',
  grammar: grammar,
  unification: true
});

// Load sentences
text = fs.readFileSync(sentencesFile, 'utf8');
var sentences = text.split('\n');

// Load results; these are in a lexicon file
/*
text = fs.readFileSync(resultsFile, 'utf8');
var results = chartParsers.LexiconParser.parse(text, {
  signature: signature
});
*/

// Test sentences and compare to results
sentences.forEach(function(sentence) {
  logger.debug('Sentence: ' + sentence);
  // Tokenize sentence
  var words = sentence.trim().split(/\s+/);
  // Tag sentence
  var taggedSentence = lexicon.tagSentence(words);
  // Parse the sentence
  var parse_result = parser.parse(taggedSentence);
  parse_result.getCompleteItemsFromTo(0, taggedSentence.length).forEach(function(item, index, array) {
    logger.debug('Item ' + index + ' of ' + array.length);
    logger.debug('Feature structure:\n' + item.data.fs.prettyPrint());
  });
});