

// --- COURSE DATA ---
const courseData = [
    {
        title: "ES6講座",
        slides: [
            {
                title: "ES6講座へようこそ！",
                content: `
                    <div class="text-center flex flex-col items-center justify-center h-full">
                        <h1 class="text-5xl font-bold text-blue-500 mb-4">ES6 Interactive Tutorial</h1>
                        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">モダンなJavaScriptを、手を動かしながらマスターしよう。</p>
                        <p class="text-lg">この講座では、ES6の主要な機能をスライドと演習を通して学習します。</p>
                        <p class="mt-12">準備ができたら、下の「次へ」ボタンを押して最初のチャプターに進みましょう！</p>
                    </div>
                `
            }
        ],
        exercise: null
    },
    {
        title: "1. 変数宣言: let と const",
        slides: [
            {
                title: "はじめに",
                content: `
                    <h3>ようこそ！</h3>
                    <p>この講座では、モダンなJavaScriptの書き方であるES6(ES2015)の主要な機能を学んでいきます。</p>
                    <p>ES6は、より安全で読みやすいコードを書くための新しい構文をたくさん導入しました。昔ながらのJavaScriptの書き方とどう違うのか、比較しながら見ていきましょう。</p>
                    <p>まずは、プログラミングの基本である「変数」の宣言方法からです。</p>
                `
            },
            {
                title: "古い変数宣言: var",
                content: `
                    <h3>問題点を抱えた <code>var</code></h3>
                    <p>ES6以前は、変数を宣言するには<code>var</code>キーワードしかありませんでした。</p>
                    <pre><code>var x = 10;</code></pre>
                    <p>しかし、<code>var</code>にはいくつかの問題点がありました。</p>
                    <ul>
                        <li>同じ名前で何回も変数を宣言できてしまう（意図しない上書きの原因になる）。</li>
                        <li>変数が使える範囲（スコープ）が分かりにくい。</li>
                    </ul>
                    <p>これらの問題を解決するために、ES6では<code>let</code>と<code>const</code>という新しい変数宣言の方法が導入されました。</p>
                `
            },
            {
                title: "再代入できる変数: let",
                content: `
                    <h3><code>let</code> による変数宣言</h3>
                    <p><code>let</code>は、値の再代入が可能な変数を宣言します。<code>var</code>の改良版と考えると分かりやすいです。</p>
                    <pre><code>let userName = "山田";
console.log(userName); // -> "山田"

userName = "鈴木"; // 再代入が可能
console.log(userName); // -> "鈴木"</code></pre>
                    <p><code>var</code>と違い、同じ名前で再び宣言しようとするとエラーになります。</p>
                    <pre><code>let userAge = 20;
let userAge = 30; // -> エラー！ SyntaxError: Identifier 'userAge' has already been declared</code></pre>
                    <p>これにより、うっかり同じ名前の変数を作ってしまうミスを防げます。</p>
                `
            },
            {
                title: "再代入できない変数: const",
                content: `
                    <h3><code>const</code> による定数宣言</h3>
                    <p><code>const</code>は、一度値を入れたら再代入できない「定数」を宣言します。定数とは、変わらない値のことです。</p>
                    <pre><code>const TAX_RATE = 0.1;
console.log(TAX_RATE); // -> 0.1

TAX_RATE = 0.12; // -> エラー！ TypeError: Assignment to constant variable.</code></pre>
                    <p>円周率や消費税率など、プログラムの途中で変わってほしくない値に使うと便利です。また、再代入しない変数には積極的に<code>const</code>を使うことで、「この変数は後から変わらない」という意図を明確にでき、コードが読みやすくなります。</p>
                    <p><strong>原則として<code>const</code>を使い、再代入が必要な場合のみ<code>let</code>を使う</strong>のが、モダンなJavaScriptのスタイルです。</p>
                `
            }
        ],
        exercise: {
            description: "<p><code>let</code>を使って<code>userName</code>という名前の変数にあなたの名前（文字列）を代入し、<code>const</code>を使って<code>birthYear</code>という名前の定数にあなたの生まれた年（数値）を代入してください。</p>",
            starterCode: `// letを使って変数を宣言してみよう\n\n\n// constを使って定数を宣言してみよう\n`,
            testFunction: (code) => {
                let ast;
                try {
                    ast = acorn.parse(code, { ecmaVersion: 2020 });
                } catch (error) {
                    return { success: false, message: `コードの文法にエラーがあります: ${error.message}` };
                }

                let letUserNameFound = false;
                let constBirthYearFound = false;
                
                ast.body.forEach(node => {
                    if (node.type === 'VariableDeclaration') {
                        node.declarations.forEach(declarator => {
                            if (declarator.id.name === 'userName' && node.kind === 'let') {
                                letUserNameFound = true;
                            }
                            if (declarator.id.name === 'birthYear' && node.kind === 'const') {
                                constBirthYearFound = true;
                            }
                        });
                    }
                });

                if (!letUserNameFound) {
                    return { success: false, message: '`let` を使って `userName` を宣言してください。' };
                }
                if (!constBirthYearFound) {
                    return { success: false, message: '`const` を使って `birthYear` を宣言してください。' };
                }

                try {
                    const func = new Function(code + 'return { userName, birthYear };');
                    const result = func();

                    if (typeof result.userName !== 'string' || result.userName.length === 0) {
                        return { success: false, message: '`userName`は空でない文字列である必要があります。' };
                    }
                    if (typeof result.birthYear !== 'number') {
                        return { success: false, message: '`birthYear`は数値である必要があります。' };
                    }
                } catch (error) {
                    return { success: false, message: `コードの実行中にエラーが発生しました: ${error.message}` };
                }

                return { success: true, message: '正解です！おめでとうございます！' };
            }
        }
    },
    {
        title: "2. 関数宣言",
        slides: [
            {
                title: "関数とは？",
                content: `
                    <h3>関数 - 処理のまとまり</h3>
                    <p>関数は、特定の処理をひとまとめにしたものです。同じ処理を何度も書きたい場合、関数として定義しておくことで、短い名前で呼び出すことができます。</p>
                    <p>関数は<code>function</code>キーワードを使って定義します。</p>
                    <pre><code>// "greet" という名前の関数を定義
function greet() {
  console.log("こんにちは！");
}

// 関数を呼び出す
greet(); // -> "こんにちは！"</code></pre>
                    <p>また、関数は「引数（ひきすう）」を受け取って、処理の内容を変えることができます。</p>
                     <pre><code>// 引数 name を受け取る関数
function greetByName(name) {
  console.log("こんにちは、" + name + "さん！");
}

greetByName("鈴木"); // -> "こんにちは、鈴木さん！"
greetByName("田中"); // -> "こんにちは、田中さん！"</code></pre>
                `
            },
            {
                title: "戻り値",
                content: `
                    <h3>処理の結果を返す - 戻り値</h3>
                    <p>関数は、処理の結果を「戻り値（もどりち）」として呼び出し元に返すことができます。戻り値には<code>return</code>キーワードを使います。</p>
                    <pre><code>function add(a, b) {
  return a + b; // aとbを足した結果を返す
}

const result = add(5, 3); // add関数の戻り値が result に代入される
console.log(result); // -> 8</code></pre>
                    <p><code>return</code>が実行されると、その時点の関数の処理は終了します。次の章で学ぶアロー関数は、この<code>function</code>の書き方をより簡潔にするためのものです。</p>
                `
            },
        ],
        exercise: {
            description: "<p>2つの数値を引数として受け取り、それらを掛け合わせた結果を戻り値として返す<code>multiply</code>という名前の関数を、<code>function</code>キーワードを使って定義してください。</p>",
            starterCode: `// multiply関数を定義してみよう`,
            testFunction: (code) => {
                try {
                    const ast = acorn.parse(code, { ecmaVersion: 2020 });
                    const funcNode = ast.body.find(n => n.type === 'FunctionDeclaration' && n.id.name === 'multiply');
                    if (!funcNode) {
                        return { success: false, message: '`function`キーワードを使って`multiply`という名前の関数を宣言してください。' };
                    }
                } catch(e) {
                     return { success: false, message: `コードの文法にエラーがあります: ${e.message}` };
                }

                try {
                    const func = new Function(code + 'return multiply;');
                    const multiply = func();
                    
                    if (typeof multiply !== 'function') {
                        return { success: false, message: '`multiply`は関数ではありません。' };
                    }
                    if (multiply(3, 4) !== 12 || multiply(-5, 10) !== -50) {
                        return { success: false, message: '関数の計算結果が正しくありません。' };
                    }
                    
                    return { success: true, message: '正解です！関数の基本を理解しましたね！' };
                } catch (error) {
                    return { success: false, message: `コードにエラーがあります: ${error.message}` };
                }
            }
        }
    },
    {
        title: "3. アロー関数",
        slides: [
            {
                title: "より短く書ける関数",
                content: `
                    <h3>アロー関数とは？</h3>
                    <p>アロー関数は、ES6で導入された新しい関数の書き方です。従来の書き方よりもシンプルに、短く関数を定義できます。</p>
                    <p>まずは、従来の関数の書き方を見てみましょう。</p>
                    <pre><code>// 従来の書き方 (関数式)
const add = function(a, b) {
  return a + b;
};
</code></pre>
                    <p>これをアロー関数で書くと、次のようになります。</p>
                    <pre><code>// アロー関数
const add = (a, b) => {
  return a + b;
};
</code></pre>
                    <p><code>function</code>キーワードがなくなり、代わりに<code>=></code>（アロー）を使います。</p>
                `
            },
            {
                title: "アロー関数の省略形",
                content: `
                    <h3>もっと短く！省略ルール</h3>
                    <p>アロー関数には、特定の条件下でさらに短く書ける省略ルールがあります。</p>
                    
                    <h4>1. 処理が1行で、その値を返すだけの場合</h4>
                    <p><code>{ }</code>と<code>return</code>を省略できます。</p>
                    <pre><code>// { } と return を省略
const add = (a, b) => a + b;</code></pre>

                    <h4>2. 引数が1つだけの場合</h4>
                    <p>引数を囲む<code>( )</code>を省略できます。</p>
                    <pre><code>// ( ) を省略
const double = number => number * 2;</code></pre>
                    <p>これらのルールを組み合わせることで、非常に簡潔に関数を表現できます。</p>
                `
            }
        ],
        exercise: {
            description: "<p>引数を1つ受け取り、その数値に10を掛けた値を返すアロー関数を、<code>multiplyByTen</code>という名前の定数に代入してください。省略形を使って、できるだけ短く書いてみましょう。</p>",
            starterCode: `// アロー関数を定義してみよう`,
            testFunction: (code) => {
                let isArrowShortform = false;
                try {
                    const ast = acorn.parse(code, { ecmaVersion: 2020 });
                    ast.body.forEach(node => {
                        if (node.type === 'VariableDeclaration') {
                            node.declarations.forEach(d => {
                                if (d.id.name === 'multiplyByTen' && d.init && d.init.type === 'ArrowFunctionExpression') {
                                    if (d.init.body.type !== 'BlockStatement') {
                                        isArrowShortform = true;
                                    }
                                }
                            });
                        }
                    });
                } catch (e) { /* ignore syntax error, it will be caught by runtime check */ }

                try {
                    const func = new Function(code + 'return multiplyByTen;');
                    const multiplyByTen = func();
                    
                    if (typeof multiplyByTen !== 'function') {
                        return { success: false, message: '`multiplyByTen`は関数ではありません。' };
                    }
                    if (multiplyByTen(5) !== 50 || multiplyByTen(0) !== 0) {
                        return { success: false, message: '関数の計算結果が正しくありません。' };
                    }
                    if (!isArrowShortform) {
                        return { success: false, message: 'アロー関数の省略形を使ってみましょう！`return`や`{}`は不要です。' };
                    }
                    return { success: true, message: '素晴らしい！簡潔に書けましたね！' };
                } catch (error) {
                    return { success: false, message: `コードにエラーがあります: ${error.message}` };
                }
            }
        }
    },
    {
        title: "4. テンプレートリテラル",
        slides: [
            {
                title: "文字列操作の進化",
                content: `
                    <h3>テンプレートリテラル</h3>
                    <p>テンプレートリテラルは、文字列の作成をより簡単で直感的にするための機能です。</p>
                    <p>従来、変数を含む文字列を作成するには、<code>+</code>演算子で連結する必要がありました。</p>
                    <pre><code>const name = "佐藤";
const age = 25;
const message = "私の名前は" + name + "です。年齢は" + age + "歳です。";
console.log(message);
// -> 私の名前は佐藤です。年齢は25歳です。</code></pre>
                    <p>これでも問題ありませんが、変数が多くなると<code>+</code>や引用符の管理が大変です。</p>
                `
            },
            {
                title: "バッククォートと${}",
                content: `
                    <h3>埋め込み式</h3>
                    <p>テンプレートリテラルでは、文字列全体をバッククォート(<code>\`</code>)で囲み、変数を<code>\${...}</code>という形式で埋め込むことができます。</p>
                    <pre><code>const name = "佐藤";
const age = 25;
const message = \`私の名前は\${name}です。年齢は\${age}歳です。\`;
console.log(message);
// -> 私の名前は佐藤です。年齢は25歳です。</code></pre>
                    <p>見た目がスッキリし、どこに変数が埋め込まれているかが一目瞭然です。また、改行もそのまま反映されます。</p>
                    <pre><code>const multiline = \`これは
複数行の
文字列です。\`;
console.log(multiline);</code></pre>
                `
            }
        ],
        exercise: {
            description: "<p>定数<code>item</code>に<code>'リンゴ'</code>を、定数<code>price</code>に<code>120</code>を代入してください。その後、テンプレートリテラルを使って、<code>&lt;item&gt;の値段は&lt;price&gt;円です。</code>という文字列を作成し、定数<code>sentence</code>に代入してください。(<code>&lt;</code>, <code>&gt;</code> は含めません)</p>",
            starterCode: `const item = 'リンゴ';\nconst price = 120;\n\n// テンプレートリテラルを使ってsentenceを定義しよう`,
            testFunction: (code) => {
                 let useTemplateLiteral = false;
                 try {
                    const ast = acorn.parse(code, {ecmaVersion: 2020});
                    ast.body.forEach(node => {
                        if (node.type === 'VariableDeclaration') {
                            node.declarations.forEach(d => {
                                if (d.id.name === 'sentence' && d.init && d.init.type === 'TemplateLiteral') {
                                    useTemplateLiteral = true;
                                }
                            });
                        }
                    });
                 } catch(e) {}
                
                try {
                    const func = new Function(code + 'return sentence;');
                    const sentence = func();
                    
                    const expected = 'リンゴの値段は120円です。';
                    if (sentence !== expected) {
                        return { success: false, message: `文字列が期待通りではありません。期待する値: "${expected}"` };
                    }
                    if (!useTemplateLiteral) {
                        return { success: false, message: 'テンプレートリテラル(バッククォート ``)を使ってみましょう。' };
                    }
                    return { success: true, message: '完璧です！文字列の扱いが楽になりますね。' };
                } catch (error) {
                    return { success: false, message: `コードにエラーがあります: ${error.message}` };
                }
            }
        }
    },
    {
        title: "5. クラス",
        slides: [
            {
                title: "オブジェクトの設計図",
                content: `
                    <h3>クラスとは？</h3>
                    <p>クラスは、オブジェクトを生成するための「設計図」のようなものです。同じ構造を持つオブジェクトをたくさん作りたい場合に便利です。</p>
                    <p>例えば、「ユーザー」を表すオブジェクトを考えてみましょう。各ユーザーは名前と年齢というプロパティ（情報）を持っています。</p>
                    <pre><code>class User {
  // ここに設計図の内容を書いていく
}</code></pre>
                    <p><code>class</code>キーワードを使ってクラスを定義します。クラス名の最初の文字は、慣習的に大文字にします。</p>
                `
            },
            {
                title: "constructor",
                content: `
                    <h3>初期化処理: constructor</h3>
                    <p><code>constructor</code>は、クラスからオブジェクトが生成されるとき（インスタンス化されるとき）に一度だけ呼ばれる特殊なメソッドです。ここで、オブジェクトの初期設定を行います。</p>
                    <pre><code>class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

// newキーワードでクラスからオブジェクトを生成
const user1 = new User("田中", 30);
console.log(user1.name); // -> "田中"
console.log(user1.age);  // -> 30</code></pre>
                    <p><code>this</code>は、これから作られるオブジェクト自身を指します。<code>this.name = name;</code>は、「このオブジェクトのnameプロパティに、引数で受け取ったnameの値を設定する」という意味です。</p>
                `
            },
            {
                title: "メソッドの定義",
                content: `
                    <h3>クラスの振る舞い: メソッド</h3>
                    <p>クラスには、プロパティだけでなく、そのオブジェクトの振る舞いを表す「メソッド」（クラスに属する関数）を定義できます。</p>
                    <pre><code>class User {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // メソッドの定義
  greet() {
    console.log(\`こんにちは、\${this.name}です。\`);
  }
}

const user1 = new User("田中", 30);
user1.greet(); // -> "こんにちは、田中です。"</code></pre>
                    <p>このように、データ（プロパティ）と処理（メソッド）をひとまとめにできるのが、クラスの強力な点です。</p>
                `
            }
        ],
        exercise: {
            description: "動物を表す<code>Animal</code>クラスを定義してください。<ul><li><code>constructor</code>で<code>name</code>と<code>sound</code>を受け取り、プロパティとして設定してください。</li><li><code>speak</code>という名前のメソッドを定義し、呼び出すと<code>&lt;name&gt;は&lt;sound&gt;と鳴く</code>という形式の文字列をコンソールに出力するようにしてください。(<code>&lt;</code>, <code>&gt;</code> は含めません)</li></ul>",
            starterCode: `class Animal {\n  // constructorを定義しよう\n\n\n  // speakメソッドを定義しよう\n\n}`,
            testFunction: (code) => {
                try {
                    const ast = acorn.parse(code, {ecmaVersion: 2020});
                    if(!ast.body.some(n => n.type === 'ClassDeclaration' && n.id.name === 'Animal')) {
                        return { success: false, message: '`Animal`という名前のクラスを定義してください。' };
                    }
                } catch (error) {
                    return { success: false, message: `コードの文法にエラーがあります: ${error.message}` };
                }

                try {
                    const AnimalClass = new Function(code + 'return Animal;')();
                    const dog = new AnimalClass('ポチ', 'ワン');

                    if (dog.name !== 'ポチ' || dog.sound !== 'ワン') {
                         return { success: false, message: 'constructorが正しくプロパティを設定していません。' };
                    }
                    if (typeof dog.speak !== 'function') {
                        return { success: false, message: '`speak`という名前のメソッドを定義してください。' };
                    }
                    let consoleOutput = '';
                    const originalLog = console.log;
                    console.log = (message) => { consoleOutput = message; };
                    dog.speak();
                    console.log = originalLog;
                    const expected = 'ポチはワンと鳴く';
                    if (consoleOutput !== expected) {
                        return { success: false, message: `speakメソッドの出力が違います。期待する出力: "${expected}"` };
                    }
                    return { success: true, message: 'クラスを正しく定義できました！' };
                } catch (error) {
                    return { success: false, message: `実行時エラー: ${error.message}` };
                }
            }
        }
    },
    {
        title: "6. クラスの継承",
        slides: [
           {
                title: "クラスの機能を引き継ぐ",
                content: `
                    <h3>継承とは？</h3>
                    <p>継承は、あるクラス（親クラス）の機能を引き継いで、新しいクラス（子クラス）作る仕組みです。</p>
                    <p>例えば、先ほどの<code>Animal</code>クラスを元に、犬に特化した<code>Dog</code>クラスを作りたい場合に使えます。</p>
                    <p>継承には<code>extends</code>キーワードを使います。</p>
                    <pre><code>// 親クラス
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(\`\${this.name}が音を出した。\`);
  }
}

// 子クラス
class Dog extends Animal {
  // Animalの機能をすべて引き継いでいる
}

const myDog = new Dog("クロ");
myDog.speak(); // -> "クロが音を出した。"</code></pre>
                    <p><code>Dog</code>クラスには何も書いていませんが、<code>Animal</code>クラスを継承しているので、<code>constructor</code>や<code>speak</code>メソッドをそのまま使えます。</p>
                `
            },
            {
                title: "super()とメソッドの追加",
                content: `
                    <h3>親の機能を呼び出す: super</h3>
                    <p>子クラスに独自の<code>constructor</code>を定義する場合、最初に<code>super()</code>を呼び出す必要があります。これは親クラスの<code>constructor</code>を呼び出すための命令です。</p>
                    <p>また、子クラスに独自のメソッドを追加したり、親クラスのメソッドを上書き（オーバーライド）したりできます。</p>
                    <pre><code>class Dog extends Animal {
  constructor(name, breed) {
    // まず親のconstructorを呼び出し、nameプロパティを設定してもらう
    super(name); 
    // 子クラス独自のプロパティを追加
    this.breed = breed;
  }

  // 親のメソッドを上書き(オーバーライド)
  speak() {
    console.log(\`\${this.name}はワンと鳴いた！\`);
  }

  // 子クラス独自のメソッドを追加
  wagTail() {
    console.log(\`\${this.name}がしっぽを振った。\`);
  }
}

const myDog = new Dog("ポチ", "柴犬");
myDog.speak();    // -> "ポチはワンと鳴いた！"
myDog.wagTail();  // -> "ポチがしっぽを振った。"
console.log(myDog.breed); // -> "柴犬"</code></pre>
                `
            }
        ],
        exercise: {
            description: "前の章で作成した<code>Animal</code>クラスを継承して、<code>Cat</code>クラスを作成してください。<ul><li><code>constructor</code>で<code>name</code>だけを受け取り、<code>super()</code>を使って親クラスに渡してください。</li><li><code>speak</code>メソッドをオーバーライドし、<code>&lt;name&gt;はニャーと鳴く</code>という形式の文字列をコンソールに出力するようにしてください。(<code>&lt;</code>, <code>&gt;</code> は含めません)</li></ul>",
            starterCode: `// このAnimalクラスは変更しないでください\nclass Animal {\n  constructor(name) {\n    this.name = name;\n  }\n  speak() {\n    console.log(\`\${this.name}が音を出した。\`);\n  }\n}\n\n// Animalを継承してCatクラスを定義しよう\n`,
            testFunction: (code) => {
                 try {
                    const ast = acorn.parse(code, {ecmaVersion: 2020});
                    const classNode = ast.body.find(n => n.type === 'ClassDeclaration' && n.id.name === 'Cat');
                    if (!classNode) {
                         return { success: false, message: '`Cat`クラスが定義されていません。' };
                    }
                    if (!classNode.superClass || classNode.superClass.name !== 'Animal') {
                        return { success: false, message: '`extends Animal` を使って継承してください。' };
                    }
                 } catch (error) {
                     return { success: false, message: `コードの文法にエラーがあります: ${error.message}` };
                 }

                try {
                    const fullCode = new Function(code + 'return {Animal, Cat};')();
                    const CatClass = fullCode.Cat;

                    const tama = new CatClass('タマ');
                    if (tama.name !== 'タマ') {
                        return { success: false, message: 'constructorで`name`を正しく設定できていませんか？`super(name)`を呼び出していますか？' };
                    }
                    let consoleOutput = '';
                    const originalLog = console.log;
                    console.log = (message) => { consoleOutput = message; };
                    tama.speak();
                    console.log = originalLog;
                    const expected = 'タマはニャーと鳴く';
                    if (consoleOutput !== expected) {
                        return { success: false, message: `speakメソッドの出力が違います。期待する出力: "${expected}"` };
                    }
                    return { success: true, message: '継承もマスターしましたね！素晴らしい！' };
                } catch (error) {
                    return { success: false, message: `実行時エラー: ${error.message}` };
                }
            }
        }
    },
    {
        title: "7. 分割代入",
        slides: [
           {
                title: "オブジェクトの分割代入",
                content: `
                    <h3>オブジェクトからデータを取り出す</h3>
                    <p>オブジェクトから特定のプロパティの値を取り出して、新しい変数に代入したいケースはよくあります。</p>
                    <pre><code>const user = {
  id: 1,
  name: "山田太郎",
  age: 30
};

// 従来の書き方
const name = user.name;
const age = user.age;

console.log(name, age); // -> "山田太郎", 30</code></pre>
                    <p>これでも問題ありませんが、ES6の分割代入を使うと、もっと短く直感的に書くことができます。</p>
                    <pre><code>// 分割代入
const { name, age } = user;

console.log(name, age); // -> "山田太郎", 30</code></pre>
                    <p><code>{ }</code>の中にオブジェクトから取り出したいプロパティ名を記述するだけで、同じ名前の変数が宣言され、値が代入されます。</p>
                `
            },
            {
                title: "配列の分割代入",
                content: `
                    <h3>配列からデータを取り出す</h3>
                    <p>配列の要素も同様に、簡単に取り出すことができます。</p>
                    <pre><code>const colors = ["赤", "緑", "青"];

// 従来の書き方
const firstColor = colors[0];
const secondColor = colors[1];

// 分割代入
const [c1, c2] = colors;
console.log(c1, c2); // -> "赤", "緑"</code></pre>
                     <p><code>[ ]</code>の中に変数名を書くと、配列の先頭から順番に値が代入されます。カンマを使うことで、不要な要素をスキップすることも可能です。</p>
                    <pre><code>const [,, thirdColor] = colors;
console.log(thirdColor); // -> "青"</code></pre>
                `
            }
        ],
        exercise: {
            description: "<h3>オブジェクトと配列の分割代入</h3><p>以下の2つの操作を行ってください。</p><ul><li>1. <code>user</code>オブジェクトから、<code>name</code>と<code>email</code>プロパティを分割代入を使って取り出し、それぞれ<code>userName</code>, <code>userEmail</code>という定数に代入してください。(<code>name: userName</code> のように別名をつけます)</li><li>2. <code>scores</code>配列から、2番目の要素(<code>95</code>)だけを分割代入を使って取り出し、<code>secondScore</code>という定数に代入してください。</li></ul>",
            starterCode: `const user = { id: 10, name: 'Suzuki', email: 'suzuki@example.com' };\nconst scores = [80, 95, 88];\n\n// 1. オブジェクトを分割代入\n\n\n// 2. 配列を分割代入\n`,
            testFunction: (code) => {
                let ast;
                try {
                    ast = acorn.parse(code, { ecmaVersion: 2020 });
                } catch(e) {
                     return { success: false, message: `コードの文法にエラーがあります: ${e.message}` };
                }

                let objectPatternFound = false;
                let arrayPatternFound = false;
                ast.body.forEach(node => {
                    if (node.type !== 'VariableDeclaration') return;
                     node.declarations.forEach(d => {
                        if (d.id.type === 'ObjectPattern') objectPatternFound = true;
                        if (d.id.type === 'ArrayPattern') arrayPatternFound = true;
                     });
                });

                if(!objectPatternFound) return { success: false, message: 'オブジェクトの分割代入を使ってください。' };
                if(!arrayPatternFound) return { success: false, message: '配列の分割代入を使ってください。' };

                try {
                    const func = new Function(code + 'return { userName, userEmail, secondScore };');
                    const result = func();

                    if(result.userName !== 'Suzuki') return { success: false, message: '`userName`の値が正しくありません。' };
                    if(result.userEmail !== 'suzuki@example.com') return { success: false, message: '`userEmail`の値が正しくありません。' };
                    if(result.secondScore !== 95) return { success: false, message: '`secondScore`の値が正しくありません。' };

                    return { success: true, message: '完璧です！分割代入をマスターしましたね！' };
                } catch(error) {
                    return { success: false, message: `実行時エラー: ${error.message}` };
                }
            }
        }
    },
    {
        title: "8. 総合テスト",
        slides: [],
        exercise: {
            description: "<h3>お疲れ様でした！最後の総合テストです。</h3><p>これまでの知識を総動員して、オンラインストアの商品を管理するクラスを作成してみましょう。</p><ul><li>1. <code>Product</code>という名前のクラスを作成してください。<ul><li><code>constructor</code>で<code>name</code> (文字列)と<code>price</code> (数値)を受け取り、プロパティとして設定します。</li><li><code>getInfo</code>というメソッドを作成し、テンプレートリテラルを使って <code>商品名: &lt;name&gt;, 価格: &lt;price&gt;円</code> という形式の文字列を返すようにしてください。(<code>&lt;</code>, <code>&gt;</code> は含めません)</li></ul></li><li>2. <code>Book</code>という名前のクラスを、<code>Product</code>クラスを継承して作成してください。<ul><li><code>constructor</code>で<code>name</code>, <code>price</code>, <code>author</code> (著者名、文字列)を受け取ります。<code>super</code>を使って<code>name</code>と<code>price</code>を親クラスに渡してください。</li><li><code>getInfo</code>メソッドをオーバーライドし、<code>商品名: &lt;name&gt;, 著者: &lt;author&gt;, 価格: &lt;price&gt;円</code> という形式の文字列を返すようにしてください。(<code>&lt;</code>, <code>&gt;</code> は含めません)</li></ul></li></ul>",
            starterCode: `// 1. Productクラスを作成\n\n\n// 2. Productクラスを継承してBookクラスを作成\n`,
            testFunction: (code) => {
                try {
                    const ast = acorn.parse(code, {ecmaVersion: 2020});
                    const productNode = ast.body.find(n => n.type === 'ClassDeclaration' && n.id.name === 'Product');
                    const bookNode = ast.body.find(n => n.type === 'ClassDeclaration' && n.id.name === 'Book');
                    if(!productNode) return { success: false, message: '`Product`クラスが定義されていません。'};
                    if(!bookNode) return { success: false, message: '`Book`クラスが定義されていません。'};
                    if(!bookNode.superClass || bookNode.superClass.name !== 'Product') return { success: false, message: '`Book`クラスは`Product`クラスを継承してください。'};
                } catch (error) {
                    return { success: false, message: `コードの文法にエラーがあります: ${error.message}` };
                }

                try {
                    const classDefs = new Function(code + 'return {Product, Book};')();
                    const Product = classDefs.Product;
                    const Book = classDefs.Book;
                    
                    const eraser = new Product('消しゴム', 100);
                    if(eraser.name !== '消しゴム' || eraser.price !== 100) return { success: false, message: 'Productクラスのconstructorが正しくありません。'};
                    if(eraser.getInfo() !== '商品名: 消しゴム, 価格: 100円') return { success: false, message: 'ProductクラスのgetInfoメソッドの戻り値が正しくありません。'};

                    const es6Book = new Book('すごいES6', 2500, '山田太郎');
                    if(es6Book.name !== 'すごいES6' || es6Book.price !== 2500 || es6Book.author !== '山田太郎') return { success: false, message: 'Bookクラスのconstructorが正しくありません。superを呼び出していますか？'};
                    if(es6Book.getInfo() !== '商品名: すごいES6, 著者: 山田太郎, 価格: 2500円') return { success: false, message: 'BookクラスのgetInfoメソッドの戻り値が正しくありません。'};
                    
                    return { success: true, message: '全問正解です！ES6の基本はマスターしましたね！素晴らしい！' };
                } catch(error) {
                    return { success: false, message: `実行時エラー: ${error.message}` };
                }
            }
        }
    }
];

