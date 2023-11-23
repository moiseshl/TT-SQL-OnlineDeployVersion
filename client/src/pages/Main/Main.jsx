import { useEffect, useState } from 'react'
import './Main.css'
import { executeQuery, initializeApp } from '../../api/api.js'
import { v4 as uuidv4 } from 'uuid';
import Table from '../../components/Table/Table.jsx'
import Message from '../../components/Message/Message.jsx'
import NavBar from '../../components/NavBar/NavBar';
import { RxHamburgerMenu } from 'react-icons/rx';
import { FaRegTrashCan } from 'react-icons/fa6';
import { IoMdSend } from 'react-icons/io';
import FormQuery from '../../components/FormQuery/FormQuery';
import { useMainContext } from '../../context/Context';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CodeEditor from '@uiw/react-textarea-code-editor';

export default function Main() {

  // const [query, setQuery] = useState('<span class="mark-keyword">SELECT</span> idCliente, nombre, edad <span class="mark-keyword">FROM</span> cliente;')
  const [query, setQuery] = useState('SELECT idCliente, nombre, edad FROM cliente')

  const [rows, setRows] = useState([])

  const [rowsInit, setRowsInit] = useState([])

  const [message, setMessage] = useState({});

  const [loading, setLoading] = useState(false);

  const { showSaveQuery, showNav, setShowNav } = useMainContext()

  const [rowsSaveResponse, setRowsSaveResponse] = useState([])

  // const [uuid, setUuid] = useState(uuidv4().replaceAll('-', ''))

  // const id = crypto.randomUUID()

  useEffect(() => {
    setShowNav(false)
    const init = async () => {
      const response = await initializeApp();
      // console.log(response);
      if (Array.isArray(response.data))
        if (!response.data.length == 0)
          setRowsInit(response.data);
    }
    init();
  }, [])

  //  const handleChange = (event) => {
  //   const value = event.target.value;
  //   // Lista de palabras clave que quieres resaltar
  //   const keywords = ['select ', 'from', 'order', 'by', 'where', 'insert', 'table', 'create', 'asc', 'desc', ' as '];
  //   // Expresión regular para buscar las palabras clave
  //   const regexKeywords = new RegExp(keywords.join('|'), 'gi');
  //   // Reemplaza las palabras clave con un span de estilo
  //   var htmlCode = value.replace(regexKeywords, (match) => `<span class="mark-keyword">${match}</span>`);
  //   // Actualiza el estado con el nuevo contenido resaltado
  //   const regexDigit = /\d+/g;
  //   htmlCode = htmlCode.replace(regexDigit, (match) => `<span class="mark-digit">${match}</span>`);
  //   // Actualiza el estado con el nuevo contenido resaltado
  //   // const regexOperators = / \W+ /g;
  //   // htmlCode = htmlCode.replace(regexOperators, (match) => `<span class="mark-operator">${match}</span>`);

  //   setQuery(htmlCode)
  // }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setRows([]);
    setMessage({});
    // const response = await executeQuery(query.replace(/<[^>]*>?/gm, ''));
    const response = await executeQuery(query);
    // console.log(response);
    if (Array.isArray(response.data)) {
      if (!response.data.length == 0) {
        setRows(response.data)
        // setRowsInit([...rowsInit, response.data]) //agregar respuesta en el arreglo de las tablas-default
      } else {
        setMessage({ data: 'No hay resultados para la consulta', error: false })
      }
    } else {
      if (response.message) {
        setMessage({ data: response.message, error: true })
      } else if (response.data.affectedRows >= 0) {
        if (response.data.affectedRows == 1) {
          setMessage({ data: `${response.data.affectedRows} fila fue afectada`, error: false })
        } else {
          setMessage({ data: `${response.data.affectedRows} filas fueron afectadas`, error: false })
        }
      }
    }
    setLoading(false);
  }

  const handleSaveResponse = () => {
    setRowsSaveResponse([rows, ...rowsSaveResponse])
  }

  return (
    <>
      <header>
        <RxHamburgerMenu onClick={() => setShowNav(!showNav)} style={{ cursor: 'pointer' }} />
      </header>
      <NavBar show={showNav} />
      <ToastContainer theme="colored" autoClose={2000} />
      {showSaveQuery && <FormQuery textAreaQuery={query} />}
      <div className={showSaveQuery ? 'layout-main-page' : 'layout-main-page active'} onClick={() => setShowNav(false)}>
        <div>
          <form className='form-query' onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px', color: '#fff' }}>
              <label>Input</label>
              <div>
                <button className='button-clear' type='button' onClick={() => setQuery('')} ><div style={{ display: 'flex', gap: '4px' }} ><FaRegTrashCan /> <p>Limpiar</p></div></button>
                <button className='button-send' type='submit' ><div style={{ display: 'flex', gap: '4px' }} ><IoMdSend /> <p>Enviar</p></div></button>
                {/* <button className='button-send' type='button' onClick={handleSaveQuery}>Save ❤️</button> */}
              </div>
            </div>
            <textarea spellCheck="false" className='textarea-query' value={query} onChange={(e) => setQuery(e.target.value)} />
            {/* <div className='htmlCodeContainer'>
              <textarea spellCheck="false" className='textarea-query-code' value={query.replace(/<[^>]*>?/gm, '')} onChange={handleChange} />
              <div className='codeHtmlQuery' dangerouslySetInnerHTML={{__html: query}} />
            </div> */}
            {/* <CodeEditor
              value={query}
              language="sql"
              placeholder="Ingresa una sentencia SQL"
              onChange={(evn) => setQuery(evn.target.value)}
              style={{
                fontSize: 16,
                backgroundColor: "#f5f5f5",
                fontFamily: 'consolas',
                borderRadius: '10px',
                minHeight: '200px',
                marginBottom: '10px'}}
            /> */}
          </form>
          <div style={{ color: '#fff', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <label>Output</label>
            { !rows.length == 0 && <button className='button-saveresponse' onClick={handleSaveResponse}>Anclar</button> }
          </div>
          {
            !rows.length == 0 && <Table rows={rows} />
          }
          {
            !Object.keys(message).length == 0 && <Message message={message}></Message>
          }
          {
            loading && <h2 style={{ color: '#fff', fontSize: '20px' }}>loading...</h2>
          }
          {
            !rowsSaveResponse.length == 0 && rowsSaveResponse.map((item, index) => (
              <Table key={index+10} rows={rowsSaveResponse[index]} responseFlag={true} responseArray={rowsSaveResponse} setRowsSaveResponse={setRowsSaveResponse} index={index} />
            ))
          }
        </div>
        <div className='default-tables'>
          {
            !rowsInit.length == 0 && rowsInit.map((item, index) => (
              <Table key={index} rows={rowsInit[index]} />
            ))
          }
        </div>
      </div>
    </>
  )
}