export const RFC_TEST_CASES = [
  {
    rfc: "1",
    description: [
      "Each record is located on a separate line, delimited by a line break (CRLF).",
    ],
    csv: ["aaa,bbb,ccc", "zzz,yyy,xxx", ""],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    rfc: "2",
    description: [
      "The last record in the file may or may not have an ending line break.",
    ],
    csv: ["aaa,bbb,ccc", "zzz,yyy,xxx"],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    rfc: "3",
    description: [
      "There maybe an optional header line appearing as the first line",
      "of the file with the same format as normal record lines. This",
      "header will contain names corresponding to the fields in the file",
      "and should contain the same number of fields as the records in",
      "the rest of the file (the presence or absence of the header line",
      "should be indicated via the optional 'header' parameter of this",
      "MIME type).",
    ],
    csv: ["field_name,field_name,field_name", "aaa,bbb,ccc", "zzz,yyy,xxx"],
    json: [
      ["field_name", "field_name", "field_name"],
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    rfc: "4 (deliberately non-compliant *)",
    description: [
      "Within the header and each record, there may be one or more",
      "fields, separated by commas. Each line should contain the same",
      "number of fields throughout the file. *Leading and trailing spaces",
      "are not considered part of a field and should be ignored.* The last",
      "field in the record must not be followed by a comma.",
    ],
    csv: ["aaa , bbb, c  cc"],
    json: [["aaa", "bbb", "c  cc"]],
  },
  {
    rfc: "5",
    description: [
      "Each field may or may not be enclosed in double quotes (however",
      "some programs, such as Microsoft Excel, do not use double quotes",
      "at all). If fields are not enclosed with double quotes, then",
      "double quotes may not appear inside the fields.",
    ],
    csv: ['"aaa","bbb","ccc"', "zzz,yyy,xxx"],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    rfc: "6",
    description: [
      "Fields containing line breaks (CRLF), double quotes, and commas",
      "should be enclosed in double-quotes.",
    ],
    csv: ['"a\r\naa","b""b""b","c,cc"'],
    json: [["a\naa", 'b"b"b', "c,cc"]],
  },
  {
    rfc: "7",
    description: [
      "If double-quotes are used to enclose fields, then a double-quote",
      "appearing inside a field must be escaped by preceding it with",
      "another double quote.",
    ],
    csv: ['aaa,"b""bb",ccc'],
    json: [["aaa", 'b"bb', "ccc"]],
  },
];

export const WHITESPACE_TEST_CASES = [
  // after comma
  {
    csv: [" aaa, bbb, ccc", " zzz, yyy, xxx", ""],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    csv: [" aaa, bbb, ccc", " zzz, yyy, xxx"],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  // after newline
  {
    csv: [" aaa,bbb,ccc", " zzz,yyy,xxx", ""],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    csv: [" aaa, bbb, ccc", " zzz, yyy, xxx"],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  // before comma, newline
  {
    csv: ["aaa ,bbb ,ccc ", "zzz ,yyy ,xxx ", ""],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    csv: ["aaa ,bbb ,ccc ", "zzz ,yyy ,xxx "],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  // inside quotes, whitespace is not trimmed
  {
    csv: ['" aaa "," bbb "," ccc "', '" zzz "," yyy "," xxx "', ""],
    json: [
      [" aaa ", " bbb ", " ccc "],
      [" zzz ", " yyy ", " xxx "],
    ],
  },
  // inside quotes, after comma
  {
    csv: [` "aaa", "bbb", "ccc"`, ` "zzz", "yyy", "xxx"`, ``],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    csv: [` "aaa", "bbb", "ccc"`, ` "zzz", "yyy", "xxx"`],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  // inside quotes, after newline
  {
    csv: [` "aaa","bbb","ccc"`, ` "zzz","yyy","xxx"`, ``],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    csv: [` "aaa", "bbb", "ccc"`, ` "zzz", "yyy", "xxx"`],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  // inside quotes, before comma, newline
  {
    csv: [`"aaa" ,"bbb" ,"ccc" `, `"zzz" ,"yyy" ,"xxx" `, ``],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  {
    csv: [`"aaa" ,"bbb" ,"ccc" `, `"zzz" ,"yyy" ,"xxx" `],
    json: [
      ["aaa", "bbb", "ccc"],
      ["zzz", "yyy", "xxx"],
    ],
  },
  // both inside and outside quotes, before comma, newline
  {
    csv: [`"aaa ," ,"bbb, " ," ,ccc" `, `"zzz   " , " yyy " , "xxx  `, `" `],
    json: [
      ["aaa ,", "bbb, ", " ,ccc"],
      ["zzz   ", " yyy ", "xxx  \n"],
    ],
  },
  {
    csv: [`"aaa\n" ," bbb" ,"ccc" `, `"zzz" ,"yyy" ,"xxx " `],
    json: [
      ["aaa\n", " bbb", "ccc"],
      ["zzz", "yyy", "xxx "],
    ],
  },
];

export const TOLERANCE_TEST_CASES = [
  { csv: [`"aaa\n" ," bbb" ,"ccc" `, `"zzz" ,"yyy"`] },
  { csv: [`"aaa\n" ," bbb" `, `"zzz" ,"yyy", xxx`] },
];

export const ERROR_TEST_CASES = [
  { csv: [" aaa, bbb, ccc", ' zzz, yyy, x"x"x'] },
  { csv: [" aaa, bbb, ccc", ' zzz, yyy, x"xx'] },
  { csv: [" aaa, bbb, ccc", ' zzz, yyy, "xx'] },
];

export const NO_TRIM_WHITESPACE_TEST_CASES = [
  // after comma
  {
    csv: [" aaa, bbb, ccc", " zzz, yyy, xxx", ""],
    json: [
      [" aaa", " bbb", " ccc"],
      [" zzz", " yyy", " xxx"],
    ],
  },
  {
    csv: [" aaa, bbb, ccc", " zzz, yyy, xxx"],
    json: [
      [" aaa", " bbb", " ccc"],
      [" zzz", " yyy", " xxx"],
    ],
  },
  // after newline
  {
    csv: [" aaa,bbb,ccc", " zzz,yyy,xxx", ""],
    json: [
      [" aaa", "bbb", "ccc"],
      [" zzz", "yyy", "xxx"],
    ],
  },
  {
    csv: [" aaa, bbb, ccc", " zzz, yyy, xxx"],
    json: [
      [" aaa", " bbb", " ccc"],
      [" zzz", " yyy", " xxx"],
    ],
  },
  // before comma, newline
  {
    csv: ["aaa ,bbb ,ccc ", "zzz ,yyy ,xxx ", ""],
    json: [
      ["aaa ", "bbb ", "ccc "],
      ["zzz ", "yyy ", "xxx "],
    ],
  },
  {
    csv: ["aaa ,bbb ,ccc ", "zzz ,yyy ,xxx "],
    json: [
      ["aaa ", "bbb ", "ccc "],
      ["zzz ", "yyy ", "xxx "],
    ],
  },
  // inside quotes, whitespace is not trimmed
  {
    csv: ['" aaa "," bbb "," ccc "', '" zzz "," yyy "," xxx "', ""],
    json: [
      [" aaa ", " bbb ", " ccc "],
      [" zzz ", " yyy ", " xxx "],
    ],
  },
];
