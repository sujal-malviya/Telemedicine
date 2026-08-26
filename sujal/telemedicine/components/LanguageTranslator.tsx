"use client";

import React, { useState } from "react";
import { ArrowLeftRight, Copy, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const LANGUAGES: Record<string, string> = {
  "am-ET": "Amharic",
  "ar-SA": "Arabic",
  "be-BY": "Bielarus",
  "bem-ZM": "Bemba",
  "bi-VU": "Bislama",
  "bjs-BB": "Bajan",
  "bn-IN": "Bengali",
  "bo-CN": "Tibetan",
  "br-FR": "Breton",
  "bs-BA": "Bosnian",
  "ca-ES": "Catalan",
  "cop-EG": "Coptic",
  "cs-CZ": "Czech",
  "cy-GB": "Welsh",
  "da-DK": "Danish",
  "dz-BT": "Dzongkha",
  "de-DE": "German",
  "dv-MV": "Maldivian",
  "el-GR": "Greek",
  "en-GB": "English",
  "es-ES": "Spanish",
  "et-EE": "Estonian",
  "eu-ES": "Basque",
  "fa-IR": "Persian",
  "fi-FI": "Finnish",
  "fn-FNG": "Fanagalo",
  "fo-FO": "Faroese",
  "fr-FR": "French",
  "gl-ES": "Galician",
  "gu-IN": "Gujarati",
  "ha-NE": "Hausa",
  "he-IL": "Hebrew",
  "hi-IN": "Hindi",
  "hr-HR": "Croatian",
  "hu-HU": "Hungarian",
  "id-ID": "Indonesian",
  "is-IS": "Icelandic",
  "it-IT": "Italian",
  "ja-JP": "Japanese",
  "kk-KZ": "Kazakh",
  "km-KM": "Khmer",
  "kn-IN": "Kannada",
  "ko-KR": "Korean",
  "ku-TR": "Kurdish",
  "ky-KG": "Kyrgyz",
  "la-VA": "Latin",
  "lo-LA": "Lao",
  "lv-LV": "Latvian",
  "men-SL": "Mende",
  "mg-MG": "Malagasy",
  "mi-NZ": "Maori",
  "ms-MY": "Malay",
  "mt-MT": "Maltese",
  "my-MM": "Burmese",
  "ne-NP": "Nepali",
  "niu-NU": "Niuean",
  "nl-NL": "Dutch",
  "no-NO": "Norwegian",
  "ny-MW": "Nyanja",
  "ur-PK": "Pakistani",
  "pau-PW": "Palauan",
  "pa-IN": "Panjabi",
  "ps-PK": "Pashto",
  "pis-SB": "Pijin",
  "pl-PL": "Polish",
  "pt-PT": "Portuguese",
  "rn-BI": "Kirundi",
  "ro-RO": "Romanian",
  "ru-RU": "Russian",
  "sg-CF": "Sango",
  "si-LK": "Sinhala",
  "sk-SK": "Slovak",
  "sm-WS": "Samoan",
  "sn-ZW": "Shona",
  "so-SO": "Somali",
  "sq-AL": "Albanian",
  "sr-RS": "Serbian",
  "sv-SE": "Swedish",
  "sw-SZ": "Swahili",
  "ta-LK": "Tamil",
  "te-IN": "Telugu",
  "tet-TL": "Tetum",
  "tg-TJ": "Tajik",
  "th-TH": "Thai",
  "ti-TI": "Tigrinya",
  "tk-TM": "Turkmen",
  "tl-PH": "Tagalog",
  "tn-BW": "Tswana",
  "to-TO": "Tongan",
  "tr-TR": "Turkish",
  "uk-UA": "Ukrainian",
  "uz-UZ": "Uzbek",
  "vi-VN": "Vietnamese",
  "wo-SN": "Wolof",
  "xh-ZA": "Xhosa",
  "yi-YD": "Yiddish",
  "zu-ZA": "Zulu",
};

export const LanguageTranslator: React.FC = () => {
  const [fromLanguage, setFromLanguage] = useState("en-GB");
  const [toLanguage, setToLanguage] = useState("es-ES");
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        inputText
      )}&langpair=${fromLanguage}|${toLanguage}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      setTranslatedText(data.responseData.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedText("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLanguages = () => {
    setFromLanguage(toLanguage);
    setToLanguage(fromLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const speakText = (text: string, language: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    speechSynthesis.speak(utterance);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-16 bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-xl p-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-indigo-700">Language Translator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Text Area */}
        <div className="space-y-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate"
            className="min-h-[120px] border-2 border-indigo-300 focus:ring-2 focus:ring-indigo-400 rounded-lg p-4"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyText(inputText)}
              aria-label="Copy input text"
              className="hover:bg-indigo-200 transition duration-300"
            >
              <Copy className="h-5 w-5 text-indigo-700" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => speakText(inputText, fromLanguage)}
              aria-label="Speak input text"
              className="hover:bg-indigo-200 transition duration-300"
            >
              <Volume2 className="h-5 w-5 text-indigo-700" />
            </Button>
          </div>
        </div>

        {/* Language Selection & Swap */}
        <div className="flex items-center space-x-4">
          <Select value={fromLanguage} onValueChange={setFromLanguage}>
            <SelectTrigger className="w-[180px] rounded-lg border-2 border-indigo-300">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={swapLanguages}
            aria-label="Swap languages"
            className="hover:bg-indigo-200 transition duration-300"
          >
            <ArrowLeftRight className="h-5 w-5 text-indigo-700" />
          </Button>

          <Select value={toLanguage} onValueChange={setToLanguage}>
            <SelectTrigger className="w-[180px] rounded-lg border-2 border-indigo-300">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Translated Text Area */}
        <div className="space-y-2">
          <Textarea
            value={translatedText}
            readOnly
            placeholder={isTranslating ? "Translating..." : "Translation"}
            className="min-h-[120px] border-2 border-indigo-300 focus:ring-2 focus:ring-indigo-400 rounded-lg p-4"
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyText(translatedText)}
              aria-label="Copy translated text"
              className="hover:bg-indigo-200 transition duration-300"
            >
              <Copy className="h-5 w-5 text-indigo-700" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => speakText(translatedText, toLanguage)}
              aria-label="Speak translated text"
              className="hover:bg-indigo-200 transition duration-300"
            >
              <Volume2 className="h-5 w-5 text-indigo-700" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={translateText}
          disabled={isTranslating || !inputText.trim()}
          className="w-full bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          {isTranslating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Translating
            </>
          ) : (
            "Translate"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LanguageTranslator;
