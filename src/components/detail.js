// @flow
import React, { Component, useState } from 'react';
import PropTypes from 'prop-types';
import Audio from './audio';
import AddWord from './add_word';
import icons from './icons';
import Tips from './tips';
import pinyin from "pinyin";
import { DictTokenizer, Segment, useDefault } from 'segmentit';
const segmentit = useDefault(new Segment());

function segment(str){
  return segmentit.doSegment(str);
}



import {
  mainBG,
  fontS,
  gapL,
  gapM,
  gapS,
  colorDanger,
  colorMuted,
  colorWarning,
  colorPrimary,
} from './style';

import type {
  ChoiceResponseType,
  ExplainResponseType,
  NonCollinsExplainsResponseType,
  MachineTranslationResponseType,
  SynonymsType,
} from '../parse';

const SMALL_FONT = 12;

const styles = {
  container: {
    transform: 'matrix(1, 0, 0, 1, 1, 1)',
    position: 'relative',
  },
  synonymsContainer: {
    marginTop: gapS,
    fontSize: SMALL_FONT,
  },
  errorP: {
    fontSize: SMALL_FONT,
    margin: `0 0 ${gapS}px 0`,
  },
  link: {
    fontSize: SMALL_FONT,
    color: colorPrimary,
    cursor: 'pointer',
  },
  info: {
    marginBottom: gapL,
  },
  infoItem: {
    marginRight: gapL,
  },
  wordType: {
    fontSize: fontS,
    marginRight: gapS,
    color: colorMuted,
  },
  meaningItem: {
    marginBottom: gapL,
  },
  explain: {
    padding: gapS,
    backgroundColor: mainBG,
  },
  exampleItem: {
    marginTop: gapM,
    paddingLeft: 20,
  },
  star: {
    width: 14,
    height: 14,
    verticalAlign: 'top',
    position: 'relative',
    top: 3,
  },
  choiceItem: {
    backgroundColor: mainBG,
    padding: gapS,
    marginBottom: gapM,
  },
  nonCollinsTips: {
    marginTop: gapS,
    marginBottom: gapM,
  },
  warnItems: {
    backgroundColor: colorWarning,
    marginBottom: gapM,
    paddingLeft: 10,
    color: '#FFF',
  },
};

function renderSentence(sentence) {
  return (
    // eslint-disable-next-line
    <span dangerouslySetInnerHTML={{ __html: sentence }} />
  );
}

function renderFrequence(frequence) {
  return (
    <div style={{ display: 'inline', verticalAlign: 'top' }}>
      {[...Array(frequence).keys()].map((_, index) => (
        <img key={index} src={icons.star} style={styles.star} alt="star" />
      ))}
    </div>
  );
}

function renderMeaning(meaning, index) {
  const {
    example: { eng, ch },
    explain: { type, typeDesc, engExplain },
  } = meaning;


  let b = pinyin(typeDesc, {
    segment: "segmentit",         // 启用分词
    group: true,
  });
  const segCh = segment(ch || "").map(obj => obj.w).join(" ");
  let a = pinyin(segCh, {
  });

  const convertedString = (engExplain||"").replace(/&#x[\dA-Fa-f]+;/g, (match) => {
    const unicodeValue = match.slice(3, -1); // Extract the hexadecimal Unicode value
    const chineseCharacter = String.fromCodePoint(parseInt(unicodeValue, 16));
    return chineseCharacter;
  });
  const cleanedString = convertedString.replace(/[a-zA-Z<>\/&;]+/g, '') // Remove alphabetical characters
    .replace(/\s{2,}/g, ' '); // Replace double spaces with a single space
  const segC = segment(cleanedString).map(obj => obj.w).join(" ");

  let c = pinyin(segC, {
  });
  let ch2 = segment(ch || "").map(obj => obj.w).join(" ");
  console.log({ch2, ch, engExplain, typeDesc, a, b, c });
  if (typeof c === "array")
    c = c.shift();
  // console.log(a,b,c);
  const chO = ch2 + " _ " + " _ " + (a ? a.join(" ") : "");
  const engExplainO = engExplain + " _ " + (c ? c.join(" ") : "");
  const typeDescO = typeDesc + " _ " + (b?b.join(" ") : "");

  return (
    <div key={index} style={styles.meaningItem}>
      <div style={styles.explain}>
        <span style={styles.wordType}>{type}</span>
        <span style={Object.assign({}, styles.wordType, { marginRight: gapL })}>
          {typeDescO}
        </span>
        {renderSentence(engExplainO)}
      </div>
      <div style={styles.exampleItem}>
        <div style={{ color: colorMuted }}>{eng}</div>
        <div style={{ color: colorMuted, marginTop: 6 }}>
          <span>
            {ch2}
          </span>
          <span>
          {a && <br />}
          {a && a.join(" ") }
          </span>
          </div>
          {/* {a && <br />} */}
          {/* {a && a.join(" ") } */}
      </div>
    </div>
  );
}

function renderWordBasic(
  wordInfo,
  synonyms: ?SynonymsType,
  search: ?(word: string) => void,
  showWordsPage: boolean,
  showNotebook: boolean,
  flash: () => {},
) {
  const { word, pronunciation, frequence, rank, additionalPattern } = wordInfo;
  let synonymsEle = null;

  if (synonyms && Array.isArray(synonyms.words) && synonyms.words.length > 0) {
    const { type, words: synonymsWords } = synonyms;

    synonymsEle = (
      <div style={styles.synonymsContainer}>
        <span>{type || ''} →</span>
        搜索
        {synonymsWords.map((synonymsWord) => (
          <a
            key={synonymsWord}
            style={styles.link}
            onClick={() => {
              if (typeof search === 'function') {
                search(synonymsWord);
              }
            }}
          >
            "{synonymsWord}"
          </a>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.info}>
      <div>
        <span
          style={Object.assign({}, styles.infoItem, { color: colorDanger })}
        >
          {word}
        </span>
        {pronunciation ? (
          <span
            style={Object.assign(
              {},
              { fontStyle: 'italic', color: colorMuted },
              styles.infoItem,
            )}
          >
            {pronunciation}
          </span>
        ) : null}
        <span style={styles.infoItem}>
          <Audio word={word} />
        </span>
        {showNotebook ? (
          <span style={styles.infoItem}>
            <AddWord word={word} showWordsPage={showWordsPage} flash={flash} />
          </span>
        ) : null}
        {frequence ? (
          <span
            style={Object.assign({}, styles.infoItem, { color: colorWarning })}
          >
            {renderFrequence(frequence)}
          </span>
        ) : null}
        {rank ? (
          <span
            style={Object.assign(
              {},
              { fontSize: fontS, fontWeight: 'bold' },
              styles.infoItem,
            )}
          >
            {rank}
          </span>
        ) : null}
        {additionalPattern ? (
          <span
            style={Object.assign(
              {},
              { fontSize: fontS, color: colorMuted },
              styles.infoItem,
            )}
          >
            {additionalPattern}
          </span>
        ) : null}
      </div>
      {synonymsEle}
    </div>
  );
}

function renderExplain(
  response: ExplainResponseType,
  showWordsPage,
  showNotebook,
  search,
  flash,
) {
  const { meanings, synonyms, wordInfo } = response;

  return (
    <div>
      {renderWordBasic(
        wordInfo,
        synonyms,
        search,
        showWordsPage,
        showNotebook,
        flash,
      )}
      <div>{meanings.map(renderMeaning)}</div>
    </div>
  );
}

function renderChoices(response: ChoiceResponseType, searchWord) {
  const { choices } = response;

  return (
    <div>
      <div style={{ marginBottom: gapL }}>请选择单词: </div>
      {choices.map((choice) => {
        const { wordType, words } = choice;

        return (
          <div key={words[0]} style={styles.choiceItem}>
            <span style={styles.wordType}>{wordType}</span>
            <span style={{ cursor: 'pointer', color: colorPrimary }}>
              {words.map((word) => (
                <span
                  key={word}
                  style={{ marginRight: gapM }}
                  onClick={() => searchWord(word)}
                >
                  {word}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function toZh(text, index) {
  let deving = false;
  // deving = true;
  let timeWait = 1;
  index = 1;
  if (text.length > 2000) {
    return new Promise((res, rej) => {
      res("too long text");
    });
  }
  if (deving) {
    return new Promise((res, rej) => {
      res("Developing, text trans here");
    });
  }
  return new Promise((resolve, reject) => {
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh&tl=vi&dt=t&q=${encodeURIComponent(text)}`;

    // Sử dụng fetch để gửi yêu cầu đến API
    setTimeout(() => {
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const translations = data[0].map(item => item[0]).join('. ');
          // console.log(data);
          console.log(`Request ${index} completed.`);
          resolve(translations);
        })
        .catch(error => {
          console.log(`Request ${index} errored.`);
          reject(error);
        });
    }, timeWait * index);
  });
}


// currentWord,
//   navigate,
//   response ?: NonCollinsExplainsResponseType,
//   showWordsPage ?: boolean,
//   showNotebook ?: boolean,
//   flash: () => {}
function renderNonCollins(
  currentWord,
  navigate,
  response,
  showWordsPage,
  showNotebook,
  flash
) {
  const wordBasic =
    response && response
      ? renderWordBasic(
          response.wordInfo,
          null,
          null,
          Boolean(showWordsPage),
          Boolean(showNotebook),
          flash,
        )
      : null;

  const responseElement = response ? (
    <div style={{ marginBottom: `${gapL}px` }}>
      {response.explains.map((item) => {

        var itemExplain = item.type ? item.explain : "";
        let explainArr = pinyin(item.explain, {
          segment: "segmentit",
          group: true,
        });
        let explain = (itemExplain ? explainArr.join(" ") : "");
        return (
        <div key={item.explain} style={styles.choiceItem}>
          {item.type ? <span style={styles.wordType}>{item.type}.</span> : null}
          <span>{item.explain}</span>
          <br />
          <span>{explain}</span>
          </div>
        );
      }) }
    </div>
  ) : null;

  return (
    <div>
      {wordBasic}
      {responseElement}
      <p style={styles.errorP}>
        未搜索到柯林斯释义。
        {currentWord ? (
          <span style={styles.link} onClick={navigate}>
            去有道搜索&quot;{currentWord}&quot;
          </span>
        ) : null}
      </p>
    </div>
  );
}

function renderMachineTranslation(response: MachineTranslationResponseType) {
  const { translation } = response;

  return (
    <div style={Object.assign({}, styles.choiceItem, { marginTop: gapM })}>
      (机翻) {translation}
    </div>
  );
}

class Detail extends Component {
  defaultProps: {
    currentWord: string,
  };

  refers: any;
  flash: () => {};

  constructor(props: any) {
    super(props);

    this.flash = this.flash.bind(this);

    this.refers = {};
  }

  flash(msg: string) {
    this.refers.tips.flash(msg);
  }

  renderContent() {
    const { flash } = this;
    const {
      search,
      currentWord,
      explain: wordResponse,
      openLink,
      showWordsPage,
      showNotebook,
    } = this.props;
    const openCurrentWord = openLink.bind(null, currentWord);
    const renderErr = renderNonCollins.bind(
      null,
      currentWord,
      openCurrentWord,
      undefined,
      showWordsPage,
      showNotebook,
      flash,
    );

    if (!wordResponse) {
      return renderErr();
    }

    const { response, type } = wordResponse;
    console.log("word response:", type, wordResponse);

    if (type === 'explain') {
      return renderExplain(
        response,
        showWordsPage,
        showNotebook,
        search,
        flash,
      );
    } else if (type === 'choices') {
      return renderChoices(response, search);
    } else if (type === 'non_collins_explain') {
      return renderNonCollins(
        currentWord,
        openCurrentWord,
        response,
        showWordsPage,
        showNotebook,
        flash,
      );
    } else if (type === 'machine_translation') {
      return renderMachineTranslation(response);
    }

    return renderErr();
  }

  render() {
    const element = this.renderContent();

    return (
      <div style={styles.container}>
        <Tips ref={(tips) => (this.refers.tips = tips)} />
        {element}
      </div>
    );
  }
}

const { func, object, string, bool } = PropTypes;

Detail.propTypes = {
  currentWord: string,
  explain: object,
  search: func.isRequired,
  openLink: func.isRequired,
  showWordsPage: bool.isRequired,
  showNotebook: bool.isRequired,
};

// $FlowFixMe
Detail.defaultProps = {
  currentWord: '',
  explain: null,
};

export default Detail;
