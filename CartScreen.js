import React, { useState, useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import { Row, Col, Card, Button, Image } from 'react-bootstrap'

import { BsPlus, BsDash, BsTrashFill } from "react-icons/bs";

import { Message } from '../components/Message';

import { CalculateIva, FormatDollar } from '../utils/methods';

import { listCart, updateCart, deleteCart } from '../actions/cartActions';

import noImage from '../assets/noimage.png';
import truckShipping from '../assets/icons/camionEnvio.svg';
import { types } from '../types/types';

export default function CartScreen({ history }) {
  const [priceTotal, setPriceTotal] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const dispatch = useDispatch();

  const cartList = useSelector(state => state.cartList)
  const { loading, cart } = cartList

  const cartUpdate = useSelector(state => state.cartUpdate)
  const { cart: cartUpdt } = cartUpdate

  const cartDelete = useSelector(state => state.cartDelete)
  const { error } = cartDelete;

  const userLogin = useSelector((state) => state.userLogin)

  useEffect(() => {
    if (userLogin && userLogin.userInfo) {
      setUserInfo(userLogin.userInfo);
      dispatch(listCart(`UserId=${userLogin.userInfo.Id}`))
    }
    document.getElementById('search-navbar').removeAttribute('style');
  }, [userLogin, dispatch])

  useEffect(() => {
    if (cart && cart.length !== 0) {
      let temp = 0;
      for (let i = 0; i < cart.length; i++) {
        const element = cart[i];
        temp += element.Price;
      }
      setPriceTotal(temp);
    }
  }, [cart])

  useEffect(() => {
    if (userInfo && cartUpdt && cartUpdt.ok) {
      dispatch(listCart(`UserId=${userInfo.Id}`));
      dispatch({ type: types.cartTypes.CART_UPDATE_RESET })
    }
  }, [cartUpdt])

  const handleUpdate = (Id, Quantity, ProductId, HasInvoice) => {
    dispatch(updateCart(Id, Quantity, ProductId, HasInvoice))
  };

  return (
    <div className="bg-color-cart">
      <Row>
        <Col>
          <div>
            <LinkContainer to={`/`}>
              <label className="mr-1 c-pointer" >Inicio</label>
            </LinkContainer>
            <label>
              {'> '}
              Bolsa de compras
            </label>
          </div>
          <h2>Bolsa de compras</h2>
          {
            !userInfo && (<Message variant="danger" children="Debes iniciar sesión para poder realizar compras" />)
          }
          < Row >
            <Col md={8} sm={12} className="mt-2">
              <Card className="bg-content-items" style={{ padding: '5% 2% 5% 2%' }}>
                <div>
                  {userInfo && cart && cart.map((element, index) => (
                    <div key={index} className="bg-black mt-2 p-2">
                      <Row>
                        <Col md={2} className="text-center justify-content-center d-flex">
                          <Image
                            src={(element.Product && Object.keys(element.Product).length !== 0 && element.Product.ImageProductPath) ? element.Product.ImageProductPath : noImage}
                            className="img-round"
                          />
                        </Col>
                        <Col md={4} className="col-space-center">
                          <p className="mb-0">Vendedor: {(element.Product && Object.keys(element.Product).length !== 0) ? element.Product.UserName : ''}</p>
                          <h6>{element.Name}</h6>
                          <p style={{ fontSize: 14 }}>
                            <Image src={truckShipping} width="25" className="mr-2" />
                            Envió gratis | Llega de 1 a 2 dias
                          </p>
                        </Col>
                        <Col md={3} className="bl-col br-col center-content col-space-center">
                          <div className="mr-2">
                            {
                              element.Quantity > 1 && (
                                <a
                                  href={this}
                                  onClick={() => {
                                    handleUpdate(element.Id, (element.Quantity - 1), element.ProductId, element.HasInvoice);
                                  }}
                                  className="btn-round center-content c-pointer"
                                >
                                  <BsDash color="white" size="20px" className="mt-auto mb-auto" />
                                </a>
                              )
                            }
                          </div>
                          <h4 className="mb-0 mr-2">{element.Quantity}</h4>
                          <a
                            href={this}
                            onClick={() => {
                              handleUpdate(element.Id, (element.Quantity + 1), element.ProductId, element.HasInvoice);
                            }}
                            className="btn-round center-content c-pointer mr-2"
                          >
                            <BsPlus color="white" size="20px" className="m-auto" />
                          </a>
                          <a
                            href={this}
                            onClick={() => {
                              dispatch(deleteCart(element.Id));
                              setTimeout(() => {
                                dispatch(listCart(`UserId=${userInfo.Id}`));
                              }, 200);
                            }}
                            className="center-content c-pointer"
                          >
                            <BsTrashFill color="red" size="20px" />
                          </a>
                        </Col>
                        <Col md={3} className="d-flex justify-content-center text-center">
                          <div className="mt-auto mb-auto">
                            <p className="mb-0">{(element.Price) && FormatDollar(element.Price)} MX</p>
                            <div className="d-inline justify-content-center text-center">
                              <label className="mb-0">Requiero Factura</label>
                              <input
                                type="checkbox"
                                name="checkbox"
                                className="ml-2 pt-2 c-pointer"
                                defaultChecked={element.HasInvoice}
                                onChange={(e) => {
                                  handleUpdate(element.Id, element.Quantity, element.ProductId, e.target.checked);
                                }}
                              />
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
            <Col md={4} sm={12} className="mt-2">
              <Card className="bg-total align-items-center">
                <h2>Total</h2>
                <div className="text-center">
                  <h2 className="d-inline">{(userInfo) ? FormatDollar((priceTotal + CalculateIva(priceTotal))) : FormatDollar(0)}</h2>
                  <p className="d-inline ml-2">MX</p>
                  <div className="line-down" />
                  <p>Precios con IVA incluido, recuerde que si necesita Facturar su pedido solo tildar la opción de "Requiero Factura" que se encuentra debajo del costo</p>
                </div>
                {
                  (userInfo && cart && cart.length !== 0) && (<LinkContainer to={`/cart/payment`}>
                    <Button
                      className="bg-black btn-size btn-font border-btn-black"
                    >
                      Continuar
                    </Button>
                  </LinkContainer>)
                }
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <div style={{ paddingBottom: '25%' }} />
    </div >
  )
}
